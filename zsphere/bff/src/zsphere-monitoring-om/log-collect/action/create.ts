import { exec, spawn } from 'child_process'
import { writeFile } from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'

import { Inject } from '@nestjs/common'
import { Args, Context, Field, Float, InputType, Mutation, ObjectType } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import dayjs from 'dayjs'
import { get, isEmpty } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { QueryManagementNodeAction } from '@/api/zstack/QueryManagementNodeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { PUBLIC_DIR } from '@/common/paths'
import { Audit } from '@/maintenance/audit/audit.model'
import { AuditResolver } from '@/maintenance/audit/audit.resolver'
import { ZsLogCollect } from '@/model/zs-log-collect.model'
import { genUuid } from '@/utils'
import { LicenseService } from '@/zsphere-administration/license/license.service'
import { OperationLog } from '@/zsphere-administration/operation-log/operation-log.model'
import { OperationLogResolver } from '@/zsphere-administration/operation-log/operation-log.resolver'

const promisifyWriteFile = promisify(writeFile)
const promisifyExec = promisify(exec)

function runCommand(command: string, args: string[]) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args)

    let stdout = ''
    let stderr = ''

    console.log(`Command ${args[0]} start running.`)

    child.stdout.on('data', data => {
      console.log('Stdout: ' + data)
      stdout += data
    })

    child.stderr.on('data', data => {
      console.log('Stderr: ' + data)
      stderr += data
    })

    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Command ${args[0]} failed with exit code ${code}: ${stderr}`))
      } else {
        console.log(`Command ${args[0]} finished.`)
        resolve(stdout)
      }
    })
  })
}

function replaceHostname(origin: string, newHostname: string): string {
  const regex = /(https?:\/\/)?([\w.-]+)(?::(\d+))?/
  const match = origin.match(regex)
  if (match) {
    const [, , oldHostname, port] = match
    return origin.replace(`${oldHostname}:${port}`, `${newHostname}:${port}`)
  }
  return origin
}

@InputType()
@ObjectType()
class OffsetTime {
  @Field(() => Float)
  amount: number

  @Field(() => String)
  unit: 'h' | 'd'
}

@InputType()
class CreateLogCollectPayload {
  @Field(() => [String], {
    description: 'mn,mn_db,host,bs,ps 通过ctl获取，operation,audit通过sql查询'
  })
  type: string[]

  @Field(() => Float, { nullable: true })
  startTime: number

  @Field(() => Float, { nullable: true })
  endTime: number

  @Field(() => OffsetTime, { nullable: true })
  offsetTime: OffsetTime

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  directDownload?: boolean
}

@InputType()
class CreateLogCollectInput {
  @Field(() => CreateLogCollectPayload)
  payload: CreateLogCollectPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateLogCollectService extends ActionService {
  @InjectModel(ZsLogCollect) private zsLogCollect: typeof ZsLogCollect
  @Inject()
  zstackApiBase: ZStackApiBase
  @Inject() operationLogResolver: OperationLogResolver
  @Inject() auditResolver: AuditResolver
  @Inject()
  queryManagementNodeAction: QueryManagementNodeAction
  @Inject() licenseService: LicenseService

  async getLogName() {
    const prefix = 'collect-log'
    const currentTime = dayjs().format('YYYYMMDDHHmmss')
    const version = await this.licenseService.getVersionByLogCollect()
    return `${prefix}-${version}_${currentTime}`
  }

  async getHostName() {
    let nodeip = ''
    const { inventories = [] } = await this.queryManagementNodeAction.call({})
    const hostNameList = inventories?.map(it => it.hostName)
    if (hostNameList?.length) {
      //通过 zsha2 来确定 是否为双管理环境  双管节点取值nodeip
      let data
      try {
        const { stdout } = await promisifyExec(`sudo /usr/local/bin/zsha2 show-config`)
        data = JSON.parse(stdout)
        if (!isEmpty(data)) {
          nodeip = data?.nodeip
        }
      } catch (err) {
        //如果没有zsha2 config 那么认为是单节点 直接赋值
        nodeip = hostNameList[0]
      }
    }
    return nodeip
  }

  // 创建目录
  async mkdir(dir: string) {
    try {
      // 创建一个目录并给予所有角色读写权限
      await runCommand('sudo', ['mkdir', '-m', '777', '-p', dir])
    } catch (err) {
      throw err
    }
  }

  // 收集ctl日志
  async collectCtlLog(
    types: string[],
    startMoment: dayjs.Dayjs,
    endMoment: dayjs.Dayjs,
    dir: string
  ) {
    try {
      const combination = types.join(',')
      const format = 'YYYY-MM-DD_HH:mm:ss'
      const startTime = startMoment.format(format)
      const endTime = endMoment.format(format)
      // ctl需要root权限，所以加上sudo
      const command = 'sudo'
      const args = [
        'zstack-ctl',
        'configured_collect_log',
        '--combination',
        combination,
        '--from-date',
        startTime,
        '--to-date',
        endTime,
        '--destination',
        dir
      ]
      return await runCommand(command, args)
    } catch (err) {
      throw err
    }
  }

  // 收集任务日志
  async collectOperationLog(startMoment: dayjs.Dayjs, endMoment: dayjs.Dayjs, dir: string) {
    try {
      const header = [
        '操作描述',
        '操作资源',
        '资源数量',
        '任务结果',
        '操作员',
        '登录IP',
        '创建时间',
        '完成时间'
      ]
      // \ufeff 为 BOM头， 用于使excel识别csv的编码
      let content = '\ufeff' + header.join(',') + '\n'

      const format = 'YYYY-MM-DD HH:mm:ss'
      const startTime = startMoment.format(format)
      const endTime = endMoment.format(format)
      const params = {
        conditions: [
          {
            key: 'createDate',
            op: Op.gte,
            value: startTime
          },
          {
            key: 'createDate',
            op: Op.lte,
            value: endTime
          },
          {
            key: 'status',
            op: Op.ne,
            value: 'Runnning'
          }
        ]
      }
      const { list = [] } = await this.operationLogResolver.operationLogList(params)
      list.forEach((item: OperationLog) => {
        const { name, status, userName, loginIp, createDate, lastOpDate } = item
        const resourceName =
          item.operationTasks?.length === 1
            ? get(item, 'operationTasks.[0].operationApis.[0].resourceName')
            : '-'
        const resourceCount = item.operationTasks?.length || '-'
        const createDateFormat = dayjs(Number(createDate)).format(format)
        const lastOpDateFormat = dayjs(Number(lastOpDate)).format(format)
        const row = [
          name,
          resourceName,
          resourceCount,
          status,
          userName,
          loginIp,
          createDateFormat,
          lastOpDateFormat
        ]
        content = content + row.join(',') + '\n'
      })

      await promisifyWriteFile(`${dir}/operation.csv`, content, {
        encoding: 'utf-8'
      })
    } catch (err) {
      throw err
    }
  }

  // 收集事件日志
  async collectAuditLog(startMoment: dayjs.Dayjs, endMoment: dayjs.Dayjs, dir: string) {
    try {
      const header = [
        'API名称',
        '资源类型',
        '消耗时间',
        '任务结果',
        '操作员',
        '开始时间',
        '完成时间'
      ]
      let content = '\ufeff' + header.join(',') + '\n'

      const startTime = String(startMoment.valueOf())
      const endTime = String(endMoment.valueOf())
      const params = {
        start: 0,
        limit: 9999,
        extraConditions: [
          {
            key: 'startTime',
            op: Op.eq,
            value: startTime
          },
          {
            key: 'endTime',
            op: Op.eq,
            value: endTime
          },
          {
            key: 'auditType',
            op: Op.eq,
            value: 'Resource'
          }
        ]
      }
      const { list = [] } = await this.auditResolver.queryAuditList(params)
      list.forEach((item: Audit) => {
        const { apiName, resourceType, duration = 0, isError, operator, createTime, time } = item
        const durationFormat = duration / 1000 + '秒,'
        const result = isError ? '失败' : '成功'
        const createDateFormat = dayjs(Number(createTime)).format('YYYY-MM-DD HH:mm:ss')
        const lastOpDateFormat = dayjs(Number(time)).format('YYYY-MM-DD HH:mm:ss')
        const row = [
          apiName,
          resourceType,
          durationFormat,
          result,
          operator,
          createDateFormat,
          lastOpDateFormat
        ]
        content = content + row.join(',') + '\n'
      })
      await promisifyWriteFile(`${dir}/audit.csv`, content, {
        encoding: 'utf-8'
      })
    } catch (err) {
      throw err
    }
  }

  // 打包
  async tar(dir: string, name: string) {
    try {
      const filePath = resolve(dir, '../', name)
      return runCommand('sudo', ['tar', '-zcvf', filePath, '-C', dir, '.', '--remove-files'])
    } catch (err) {
      throw err
    }
  }

  // 主函数
  async createHelper(
    type: string[],
    startMoment: dayjs.Dayjs,
    endMoment: dayjs.Dayjs,
    logUuid: string,
    oldOrigin?: string
  ) {
    try {
      const hostname = await this.getHostName()
      const logName = await this.getLogName()
      const logDir = resolve(PUBLIC_DIR, 'logs', logName)
      const fileName = `${logName}.tar.gz`
      const newOrigin = replaceHostname(oldOrigin, hostname)
      const logUrl = `${newOrigin}/public/logs/${fileName}`

      // 新增日志记录
      await this.zsLogCollect.create({
        uuid: logUuid,
        name: fileName,
        host: hostname,
        // todo 需要修改
        // dir: logDir,
        type: type.join(','),
        state: 'RUNNING',
        url: '',
        startTime: startMoment.toDate(),
        endTime: endMoment.toDate(),
        createDate: new Date(),
        lastOpDate: new Date()
      })

      // 创建目录
      await this.mkdir(logDir)

      // 收集ctl日志
      const ctlTypes = type.filter(item => !['operation', 'audit'].includes(item))
      if (ctlTypes.length > 0) {
        await this.collectCtlLog(ctlTypes, startMoment, endMoment, logDir)
      }

      // 收集操作日志
      if (type.includes('operation')) {
        await this.collectOperationLog(startMoment, endMoment, logDir)
      }

      // 收集审计日志
      if (type.includes('audit')) {
        await this.collectAuditLog(startMoment, endMoment, logDir)
      }

      // 打包
      await this.tar(logDir, fileName)

      // 修改日志记录
      await this.zsLogCollect.update(
        {
          url: logUrl,
          state: 'SUCCESS',
          lastOpDate: new Date()
        },
        {
          where: {
            uuid: logUuid
          }
        }
      )
    } catch (err) {
      console.log(err)
      await this.zsLogCollect.update(
        {
          state: 'FAILED',
          lastOpDate: new Date()
        },
        {
          where: {
            uuid: logUuid
          }
        }
      )
      throw err
    }
  }

  @Mutation(() => ActionResult)
  createLogCollect(
    @Args('input') input: CreateLogCollectInput,
    @Context() context: { req: Request }
  ) {
    const actionId = input.action.actionId

    const actionFn = async (payload: CreateLogCollectPayload, taskId: string) => {
      const { type, startTime, endTime, offsetTime, directDownload } = payload
      const apiId = genUuid()
      const apiRecord = await this.zstackApiBase.recordStart(
        { type, startTime, endTime },
        { actionId, taskId, apiId },
        'CREATE_LOG_COLLECT'
      )
      try {
        let startMoment = dayjs()
        let endMoment = dayjs()
        if (offsetTime) {
          const { amount, unit } = offsetTime
          startMoment = startMoment.subtract(amount, unit)
        }
        if (startTime && endTime) {
          startMoment = dayjs(startTime)
          endMoment = dayjs(endTime)
        }
        const origin = context.req.headers['origin'] || '' //e2e:context.req.headers['origin']取不到值,导致origin.match出现TypeError
        await this.createHelper(type, startMoment, endMoment, apiId, origin)
        await this.zstackApiBase.recordSuccess({ success: true }, apiRecord)
      } catch (err) {
        console.log('CREATE_LOG_COLLECT', err)
        await this.zstackApiBase.recordFailed({ success: false, msg: err }, apiRecord)
        throw err
      }

      const log = await this.zsLogCollect.findOne({
        where: {
          uuid: apiId
        }
      })

      const { uuid, url, state } = log

      return {
        id: taskId,
        inventory: directDownload
          ? {
              uuid,
              url,
              state
            }
          : { uuid, state }
      }
    }

    this.actionHelper(input, 'LogCollect', actionFn)
    return { actionId }
  }
}
