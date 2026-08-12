import { exec } from 'node:child_process'
import { promisify } from 'node:util'

import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import { ApolloError } from 'apollo-server-errors'
import { isEmpty } from 'lodash'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetLogConfigurationAction } from '@/api/zstack/GetLogConfigurationAction'
import { GetManagementNodesStatusAction } from '@/api/zstack/GetManagementNodesStatusAction'
import { QueryManagementNodeAction } from '@/api/zstack/QueryManagementNodeAction'
import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'
import ZQL from '@/common/zql/index'
import { ZsSession } from '@/model/zs-session.model'
import { PrivilegeService } from '@/privilege/privilege.service'
import { execCommand } from '@/utils'

import { ManagementNodeQueryResp } from './management-node.model'

const promisifyExec = promisify(exec)
@Injectable()
export class ManagementNodeService {
  @Inject() getLogConfigurationAction: GetLogConfigurationAction
  @Inject() configService: ConfigService
  @Inject() zqlService: ZQLService
  @Inject() queryManagementNodeAction: QueryManagementNodeAction
  @Inject() getManagementNodesStatusAction: GetManagementNodesStatusAction
  @Logger(ManagementNodeService.name) private logger: ZSLoggerService
  @Inject(CONTEXT) private readonly context
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject() privilegeService: PrivilegeService

  /**
   * @description 只是给下面那个query函数用的
   * @param list
   * @param i
   * @param peerport
   * @param vip
   */
  genQueryPromise(list: any[], i, peerport, vip) {
    return async () => {
      const ip = list[i]
      const cmd =
        i === 0
          ? `sudo /usr/local/bin/zsha2 status -json`
          : `sudo /bin/ssh root@${list[i]} -p ${peerport} /usr/local/bin/zsha2 status -json`
      let status: any
      try {
        const { stdout: _stdout } = await execCommand(cmd)
        status = JSON.parse(_stdout)
      } catch {
        status = {
          ownsVip: false,
          peerReachable: false,
          gwReachable: false,
          vipReachable: false,
          slaveIoRunning: false,
          slaveSqlRuning: false,
          dbStatus: 'unknown',
          mnStatus: 'unknown'
        }
      }
      list[i] = {
        ip,
        vip,
        ...status
      }
    }
  }

  async query(): Promise<ManagementNodeQueryResp> {
    const sessionId = this.context.req.headers['x-session-id']
    const session = await this.zsSession.findOne({ where: { sessionId } })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const hasPrivilege = await this.privilegeService.hasPrivilege()
    if (!hasPrivilege) {
      throw new ApolloError('无UI权限', 'FORBIDDEN', { statusCode: 403 })
    }
    const { stdout } = await execCommand(`sudo /usr/local/bin/zsha2 show-config`)
    const data = JSON.parse(stdout)
    const list = [data.nodeip, data.peerip]
    const vip = data.dbvip
    const peerport = data.peerport || '22'
    const promiseToExec = []
    for (let i = 0; i < list.length; i++) {
      // 改成并发执行可以使执行速度快一倍左右
      promiseToExec.push(this.genQueryPromise(list, i, peerport, vip)())
    }
    await Promise.all(promiseToExec)
    return {
      list: list,
      total: list.length
    }
  }

  async queryNodeInfo(): Promise<Partial<ManagementNodeQueryResp>> {
    if (await this.isDoubleManagementNode()) {
      try {
        const { stdout: zsha2Config } = await execCommand(`sudo /usr/local/bin/zsha2 show-config`)
        this.logger.debug(`[ZSHA2] [CONFIG]: ${zsha2Config}`)
        const { nodeip, peerip, dbvip, nic } = JSON.parse(zsha2Config)
        const list = [
          {
            ip: nodeip,
            ownsVip: false
          },
          {
            ip: peerip,
            ownsVip: false
          }
        ]
        try {
          const cmd = `ip addr show dev ${nic} | grep -q -w ${dbvip}`
          const { stdout: ipAddr } = await execCommand(cmd)
          this.logger.debug(`[ZSHA2] [IP ADDR]: ${ipAddr}`)
          list[0].ownsVip = true
        } catch (error) {
          console.log(error)
          list[1].ownsVip = true
        }
        return {
          list
        }
      } catch (error) {
        console.log(error)
        return {
          list: []
        }
      }
    } else {
      const { inventories } = await this.queryManagementNodeAction.call({})
      return {
        list: inventories.map(it => ({
          ip: it.hostName,
          ownsVip: false
        }))
      }
    }
  }

  async isDoubleManagementNode(): Promise<boolean> {
    let result = false
    try {
      const { stdout } = await execCommand(`sudo /usr/local/bin/zsha2 show-config`)
      this.logger.debug(`[ZSHA2] [DOUBLE]: ${stdout}`)
      const data = JSON.parse(stdout)
      result = data !== null
    } catch {
      this.logger.debug(`[ZSHA2] [NONDOUBLE]`)
      result = false
    }
    return result
  }

  async getDoubleManagementNodeInfo() {
    let hostNameList = []
    let isDualManagementNode = false
    let statusList = []

    const { results = [] } = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'ManagementNode',
        fields: ['hostName']
      })
    )
    const hostListForGetLicenseInfo = results?.[0]?.inventories?.map(it => it.hostName)

    /**
     * 先判断节点状态
     * 获取statusList逻辑
     * 给后端提了一个improve jira：
     * APIQueryManagementNodeMsg，返回两个节点的信息=两个节点都正常；返回一个，那就是一个正常一个unknown；
     */
    if (hostListForGetLicenseInfo?.length === 1) {
      //通过 zsha2 来确定 是否为双管理环境
      let data: any
      try {
        const { stdout } = await execCommand(`sudo /usr/local/bin/zsha2 show-config`)
        data = JSON.parse(stdout)
        if (!_.isEmpty(data)) {
          isDualManagementNode = true
          hostNameList = [data?.nodeip, data?.peerip]
          statusList = ['running', 'unknown']
        }
      } catch (_err) {
        //如果没有zsha2 config 那么认为是单节点
        isDualManagementNode = false
        statusList = ['running']
        hostNameList = hostListForGetLicenseInfo
      }
    } else if (hostListForGetLicenseInfo?.length === 2) {
      statusList = ['running', 'running']
      isDualManagementNode = true
      hostNameList = hostListForGetLicenseInfo
    } else {
      //没有管理节点信息，
      statusList = ['unknown']
    }
    return {
      hostNameList,
      isDualManagementNode,
      statusList,
      isManagementNodeLegal:
        (isDualManagementNode && _.every(statusList, state => state === 'running')) ||
        !isDualManagementNode,
      hostListForGetLicenseInfo
    }
  }

  async getManagementNodeIp() {
    let nodeip = ''
    const { inventories = [] } = await this.queryManagementNodeAction.call({})
    const hostNameList = inventories?.map(it => it.hostName)
    if (hostNameList?.length) {
      //通过 zsha2 来确定 是否为双管理环境  双管节点取值nodeip
      let data: any
      try {
        const { stdout } = await promisifyExec(`sudo /usr/local/bin/zsha2 show-config`)
        data = JSON.parse(stdout)
        if (!isEmpty(data)) {
          nodeip = data?.nodeip
        }
      } catch (_err) {
        //如果没有zsha2 config 那么认为是单节点 直接赋值
        nodeip = hostNameList[0]
      }
    }
    return { ip: nodeip }
  }

  async getManagementNodesStatus() {
    const { inventory = {} } = await this.getManagementNodesStatusAction.call({})
    const { nodes = [], vip, uiHttpPath } = inventory
    const pickKeys = [
      'ip',
      'managementsNodeStatus',
      'databaseStatus',
      'gatewayIp',
      'gatewayReachable',
      'haMonitorStatus',
      'keepalivedStatus',
      'ownsVip',
      'peerReachable',
      'slaveIoRunning',
      'slaveSqlRunning',
      'uiStatus',
      'vipReachable',
      'error'
    ]
    return {
      nodes: nodes.map(node => _.pick(node, pickKeys)),
      vip,
      uiHttpPath
    }
  }
}
