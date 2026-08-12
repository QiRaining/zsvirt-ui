import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'

import { Condition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetIpAddressCapacityAction } from '@/api/zstack/GetIpAddressCapacityAction'
import { GetVersionAction } from '@/api/zstack/GetVersionAction'
import { QueryL3NetworkAction } from '@/api/zstack/QueryL3NetworkAction'
import { QueryManagementNodeAction } from '@/api/zstack/QueryManagementNodeAction'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { CubeService } from '@/cube/cube.service'
import { ZopsLongJob } from '@/model/zops-long-job.model'
import { execCommand } from '@/utils'

import { QueryInspectionTaskAction } from './action/QueryInspectionTaskAction'
import { QueryZQLAction } from './action/QueryZQLAction'
import {
  InspectionTaskState,
  InspectionSubTaskState,
  InspectionSubTaskHealthState,
  QueryInsepctionArgs
} from './inspection.model'

// 根据固定顺序排序
function sortByOrder(data: any[], order: string[]) {
  return _.sortBy(data, item => {
    return order.indexOf(item.key)
  })
}

// 扁平转换成树结构
function flatToTree(data: any[], ...processItems: ((item: any) => any)[]) {
  const tree = []
  const temp = {}
  for (const item of data) {
    for (const processItem of processItems) {
      processItem(item)
    }
    const { tag } = item
    if (!temp[tag]) {
      temp[tag] = {
        key: tag,
        children: []
      }
      tree.push(temp[tag])
    }
    temp[tag].children.push(item)
  }
  //按照管理、计算、网络、存储、高可用服务、全局设置的顺序进行展示
  const order = ['platform', 'compute', 'network', 'storage', 'globalConfig']
  const sortedTree = sortByOrder(tree, order)
  return sortedTree
}

@Injectable()
export class InspectionService {
  @Inject() queryZQLAction: QueryZQLAction
  @Inject() queryInspectionTaskAction: QueryInspectionTaskAction
  @Inject() queryManagementNodeAction: QueryManagementNodeAction
  @Inject() getVersionAction: GetVersionAction
  @Inject() queryL3NetworkAction: QueryL3NetworkAction
  @Inject() getIpAddressCapacityAction: GetIpAddressCapacityAction
  @InjectModel(ZopsLongJob) private zopsLongJob: typeof ZopsLongJob
  @Inject() zqlService: ZQLService
  @Inject() cubeService: CubeService

  // 查询巡检项
  async queryInspectionItemTree() {
    const zql = `query inspect/item where status=1 and tag in json('["compute","globalConfig","network","platform","storage"]') order by serial_num asc`
    const res = await this.queryZQLAction.call({ zql })
    const flatData = res?.data ?? []
    // 约定把name去空格换成.，用作i18n的key
    function parseNameToKey(item: any) {
      item.key = item.name?.replace(/\(|\)/g, '')?.trim()?.split(/\s+/)?.join('.')
    }
    function parseDescName(item: any) {
      item.desc = item.describe_name
    }
    // 后端返回的是扁平的，需要转换成树结构
    const treeData = flatToTree(flatData, parseNameToKey, parseDescName)
    return treeData
  }

  // 查询巡检任务详情
  async queryInspectionTask(taskUuid: string) {
    const res = await this.queryInspectionTaskAction.call({ taskUuid })
    const runTime = res?.runtime || 1
    const currentSubTask =
      res?.currentSubTask?.replace(/\(|\)/g, '')?.trim()?.split(/\s+/)?.join('.') ?? ''
    const taskInfo = res?.taskInfo ?? {}
    const subItems = res?.subItems ?? []
    let total = 0
    let error = 0
    let normal = 0
    function processTaskProgress(_task: any) {
      _task.progress = _task.process || 0
    }
    processTaskProgress(taskInfo)
    function processTaskState(_task: any) {
      let state = InspectionTaskState.INIT
      switch (_task?.status) {
        case 1:
          state = InspectionTaskState.RUNNING
          break
        case 2:
          state = InspectionTaskState.SUSPENDED
          break
        case 3:
          state = InspectionTaskState.FAILED
          break
        case 4:
          state = InspectionTaskState.SUCCESS
          break
        case 5:
          state = InspectionTaskState.CANCELED
          break
      }
      _task.state = state
    }
    processTaskState(taskInfo)

    function parseNameToKey(_subTask: any) {
      _subTask.key = _subTask.subTaskName?.replace(/\(|\)/g, '')?.trim()?.split(/\s+/)?.join('.')
    }
    function processSubTaskState(_subTask: any) {
      let state = InspectionSubTaskState.INIT
      switch (_subTask?.status) {
        case 1:
          state = InspectionSubTaskState.RUNNING
          break
        case 2:
          state = InspectionSubTaskState.EMPTY
          total += 1
          break
        case 3:
          state = InspectionSubTaskState.FAILED
          total += 1
          break
        case 4:
          state = InspectionSubTaskState.SUCCESS
          total += 1
          break
      }
      _subTask.state = state
      let healthState = InspectionSubTaskHealthState.NORMAL
      if (state === InspectionSubTaskState.FAILED) {
        healthState = InspectionSubTaskHealthState.FAILED
        error += 1
      } else if (
        state !== InspectionSubTaskState.INIT &&
        state !== InspectionSubTaskState.RUNNING
      ) {
        switch (_subTask?.healthStatus) {
          case 0:
            healthState = InspectionSubTaskHealthState.CRITICAL
            error += 1
            break
          case 50:
            healthState = InspectionSubTaskHealthState.WARN
            error += 1
            break
          case 100:
            healthState = InspectionSubTaskHealthState.NORMAL
            normal += 1
            break
        }
      }
      _subTask.healthState = healthState
    }
    function processSubTaskOriginOutput(_subTask: any) {
      const originOutput = _subTask?.originOutput ?? []
      for (const item of originOutput) {
        let healthState = InspectionSubTaskHealthState.NORMAL
        switch (item?.level) {
          case 'critical':
            healthState = InspectionSubTaskHealthState.CRITICAL
            break
          case 'warn':
            healthState = InspectionSubTaskHealthState.WARN
            break
          case 'normal':
            healthState = InspectionSubTaskHealthState.NORMAL
            break
          case 'failed':
            healthState = InspectionSubTaskHealthState.FAILED
            break
        }
        item.healthState = healthState
        if (item.errInfo) {
          // 后端做了base64编码，需要解码
          item.errInfo = Buffer.from(item.errInfo, 'base64').toString()
        }
        item.origin = JSON.stringify(item.origin)
      }
    }
    const itemTree = flatToTree(
      subItems,
      parseNameToKey,
      processSubTaskState,
      processSubTaskOriginOutput
    )

    const result = {
      ...taskInfo,
      runTime,
      currentSubTask,
      total,
      error,
      normal,
      itemTree
    }
    return result
  }

  // 查询巡检任务详情
  async queryInspectionTaskOutput(args: QueryInsepctionArgs) {
    const { conditions, sortBy, sortDirection, limit = 10, start = 0 } = args
    const taskUuid = conditions.find(item => item.key === 'taskUuid')?.value
    const subTaskName = conditions.find(item => item.key === 'subTaskName')?.value
    if (!taskUuid || !subTaskName) {
      return {
        list: [],
        total: 0
      }
    }

    const zql = `query inspect/subtask where taskUuid='${taskUuid}' and subTaskName='${subTaskName}'`
    const res = await this.queryZQLAction.call({ zql })
    const subItems = res?.data ?? []
    const originOutput = subItems.find(item => item.subTaskName === subTaskName)?.originOutput ?? []

    for (const item of originOutput) {
      let healthState = InspectionSubTaskHealthState.NORMAL
      switch (item?.level) {
        case 'critical':
          healthState = InspectionSubTaskHealthState.CRITICAL
          break
        case 'warn':
          healthState = InspectionSubTaskHealthState.WARN
          break
        case 'normal':
          healthState = InspectionSubTaskHealthState.NORMAL
          break
        case 'failed':
          healthState = InspectionSubTaskHealthState.FAILED
          break
      }
      item.healthState = healthState
      if (item.errInfo) {
        // 后端做了base64编码，需要解码
        item.errInfo = Buffer.from(item.errInfo, 'base64').toString()
      }
      item.origin = JSON.stringify(item.origin)
    }
    let list = []
    if (sortBy) {
      list = _.orderBy(originOutput, sortBy, sortDirection)
    } else {
      // 巡检结果默认排序:CRITICAL、WARN、NORMAL
      const orderList = [
        InspectionSubTaskHealthState.CRITICAL,
        InspectionSubTaskHealthState.WARN,
        InspectionSubTaskHealthState.NORMAL
      ]
      list = _.orderBy(originOutput, item => orderList.indexOf(item.healthState))
    }
    // 根据巡检结果过滤
    // healthState -> result 新增字段健康状态，所以原来的healthState改为result
    const healthStates = conditions.find(item => item.key === 'result')?.values
    if (healthStates) {
      list = list.filter(item => healthStates.includes(item.healthState))
    }
    const total = list.length

    list = _.slice(list, start, start + limit)

    const result = {
      list,
      total
    }
    return result
  }

  // 查询巡检任务列表
  // 当前版本只处理部分condition
  async queryInspectionTaskList(args: QueryInsepctionArgs) {
    const conditions = {}
    args.conditions?.forEach(item => {
      const { key, value, values } = item
      if (value) {
        conditions[key] = {
          [Op.eq]: value
        }
      }
      if (values) {
        conditions[key] = {
          [Op.in]: values
        }
      }
    })

    const taskList =
      (await this.zopsLongJob.findAll({
        where: conditions,
        order: [['id', 'DESC']]
      })) ?? []
    const result = taskList.map(item => ({
      taskUuid: item.longJobUuid,
      state: item.state,
      progress: item.progress,
      readStatus: item.readStatus
    }))

    return result
  }

  // 查询巡检资源数量
  async queryInspectionResource() {
    const resourceList = ['Host', 'BackupStorage', 'VmInstance', 'PrimaryStorage'] as const
    const conditionMap = {
      VmInstance: {
        type: 'UserVm',
        state: {
          [ZOp.ne]: 'Destroyed'
        },
        hypervisorType: {
          [ZOp.ne]: 'ESX'
        }
      },
      BackupStorage: {
        type: {
          [ZOp.ne]: 'VCenter'
        },
        __systemTag__: {
          [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
        }
      },
      Host: {
        hypervisorType: {
          [ZOp.notIn]: ['ESX', 'baremetal2']
        }
      },
      PrimaryStorage: {
        type: {
          [ZOp.ne]: 'VCenter'
        }
      }
    }
    let host = 0
    let backupStorage = 0
    let vmInstance = 0
    let primaryStorage = 0
    const zqlObjectList: ZqlObject[] = resourceList.map(item => ({
      tableName: item,
      condition: conditionMap[item],
      returnWith: {
        total: true
      }
    }))
    try {
      const zql = ZQL.multStringify(zqlObjectList)
      const { results } = await this.zqlService.call(zql)
      const countList = results.map(item => item.total)
      ;[host, backupStorage, vmInstance, primaryStorage] = countList
    } catch (error) {
      console.error(error)
    }

    return {
      host,
      backupStorage,
      vmInstance,
      primaryStorage
    }
  }

  // 查询自动巡检定时任务
  async queryCrontab() {
    const zql = `query stat/task where name='default_inspection_task'`
    const res = await this.queryZQLAction.call({ zql })

    const task = res?.data?.[0] ?? {}
    return task
  }

  // 查询最后一次巡检任务、包括自动巡检
  async queryCrontabInspection() {
    const zql = `query inspect/task where status=4 order by endTime desc limit 1`
    const res = await this.queryZQLAction.call({ zql })

    const corn = await this.queryCrontab()
    const task = res?.data?.[0] ?? {}
    // if(task?.taskUuid) {
    //   return this.queryInspectionTask(task?.taskUuid)
    // }
    return {
      ...task,
      ...corn,
      startTime: corn.startTime
    }
  }

  async getReportPlatformData(sessionId: string) {
    const mnRes = await this.queryManagementNodeAction.call({}, { sessionId })
    const mn = mnRes?.inventories?.map(item => item?.hostName)?.join('、')
    const isCube = await this.cubeService.isCube()
    let couldVersion = ''
    if (isCube) {
      couldVersion = await this.cubeService.getVersion()
    } else {
      const res = await this.getVersionAction.call({}, { sessionId })
      couldVersion = res.version
    }
    const result: any = { mn, couldVersion }

    try {
      result.coreVersion = (await execCommand('uname -r')).stdout
      result.systemVersion = (await execCommand('cat /etc/redhat-release')).stdout
    } catch (e) {}

    return result
  }

  private countZql = async (tableName: string, condition: any, sessionId: string) => {
    const zqlObject = {
      tableName,
      action: ZQLAction.COUNT,
      condition
    }
    const zql = ZQL.stringify(zqlObject)
    const res = await this.zqlService.call(zql, {
      actionId: 'mainJobId',
      sessionId
    })
    return res.results[0].total
  }

  async getResourceData(sessionId: string) {
    const getTotal = async (tableName: string, condition?: any) =>
      this.countZql(tableName, condition, sessionId)

    const vmCondition = {
      type: 'UserVm',
      state: {
        [ZOp.ne]: 'Destroyed'
      },
      hypervisorType: {
        [ZOp.ne]: 'ESX'
      }
    }
    const vmTotal = await getTotal('VmInstance', vmCondition)
    const vmRunning = await getTotal('VmInstance', {
      ...vmCondition,
      state: 'Running'
    })
    const vmStop = await getTotal('VmInstance', {
      ...vmCondition,
      state: 'Stopped'
    })
    const vm = {
      total: vmTotal,
      running: vmRunning,
      stop: vmStop,
      other: vmTotal - vmRunning - vmStop
    }

    const volumeCondition = {
      type: 'Data',
      format: {
        [ZOp.ne]: 'vmtx'
      }
    }
    const volumnTotal = await getTotal('Volume', {
      status: {
        [ZOp.ne]: 'Deleted'
      },
      ...volumeCondition
    })
    const volumnReady = await getTotal('Volume', {
      status: 'Ready',
      ...volumeCondition
    })
    const volumnNotInstantiated = await getTotal('Volume', {
      status: 'NotInstantiated',
      ...volumeCondition
    })
    const volume = {
      total: volumnTotal,
      ready: volumnReady,
      notInstantiated: volumnNotInstantiated,
      other: volumnTotal - volumnReady - volumnNotInstantiated
    }

    const queryHardwareCount = async (tableName: string, condition: any = {}) => {
      const total = await getTotal(tableName, condition)
      const connected = await getTotal(tableName, {
        status: 'Connected',
        ...condition
      })
      const disconnected = await getTotal(tableName, {
        status: 'Disconnected',
        ...condition
      })
      return {
        total,
        connected,
        disconnected,
        other: total - connected - disconnected
      }
    }
    const host = await queryHardwareCount('Host', {
      hypervisorType: {
        [ZOp.notIn]: ['ESX', 'baremetal2']
      }
    })
    const primaryStorage = await queryHardwareCount('PrimaryStorage', {
      type: {
        [ZOp.ne]: 'VCenter'
      }
    })
    const imageStorage = await queryHardwareCount('BackupStorage', {
      type: {
        [ZOp.ne]: 'VCenter'
      },
      __systemTag__: {
        [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
      }
    })

    const queryNetworkCount = async (type: 'flat' | 'public' | 'vpc') => {
      const category = type === 'public' ? type : 'Private'
      const conditions: Condition[] = [
        {
          key: 'category',
          op: Op.eq,
          value: category
        },
        {
          key: 'type',
          op: type === 'vpc' ? Op.eq : Op.ne,
          value: 'L3VpcNetwork'
        }
      ]

      const res = await this.queryL3NetworkAction.call(
        { conditions, fields: ['uuid'] },
        { sessionId }
      )
      const l3NetworkUuidList = res.inventories.map(it => it?.uuid)
      let ipCapacity: any = {
        ipv4TotalCapacity: 0,
        ipv4AvailableCapacity: 0
      }
      if (l3NetworkUuidList?.length) {
        ipCapacity = await this.getIpAddressCapacityAction.call(
          { l3NetworkUuids: l3NetworkUuidList },
          { sessionId }
        )
      }

      return {
        total: ipCapacity.ipv4TotalCapacity,
        available: ipCapacity.ipv4AvailableCapacity
      }
    }

    return {
      vm,
      volume,
      host,
      primaryStorage,
      imageStorage,
      vpcNetwork: await queryNetworkCount('vpc'),
      flatNetwork: await queryNetworkCount('flat'),
      publicNetwork: await queryNetworkCount('public')
    }
  }
}
