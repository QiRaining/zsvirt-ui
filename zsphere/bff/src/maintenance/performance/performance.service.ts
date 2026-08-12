import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { conditionsToObject, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetVmGuestToolsInfoAction } from '@/api/zstack/GetVmGuestToolsInfoAction'
import { QueryAccountResourceRefAction } from '@/api/zstack/QueryAccountResourceRefAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { ActionService } from '@/base/action-service'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql'
import { arrayToMap } from '@/common/zql/queryConditionTranslator'
import { ZqlObject, ZwatchObject } from '@/common/zql/zqlBuilder'
import { GuestToolsState } from '@/zsphere-resource/vm-instance/vm-instance.model'

import {
  PerformanceThresholdSymbolType,
  PerformanceType,
  QueryPerformanceArgs
} from './performance.model'

interface FilterZStackMetric {
  _metrics: string[]
  startTime
  endTime
  period
  list: any[]
  zqlObj: ZqlObject
  uuidName: string
  needFilterMetricName: string[]
}
@Injectable()
export class PerformanceService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() queryAccountResourceRefAction: QueryAccountResourceRefAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() getVmGuestToolsInfoAction: GetVmGuestToolsInfoAction

  /**
   * 删除使用， 后端需要优化，现在改用3.x 实现方式
   *
   * 逻辑：先排序和分页，然后过滤
   *
   * 对于资源的zwatch ， 涉及到 分页，过滤，排序的需要注意zwatch的用法
   *  操作：分页、过滤、排序  ， 资源：例如云主机
   * 1. 所有的 zwatch 操作 都是对zwatch的 不是资源
   * 2. zwatch 分页语法： functions=pagination(limit=\"12\",start=\"12\")
   * 3. zwatch 排序语法： functions=sort(by=\"value\",direction=\"${sortDirection}\")
   * 4. zwatch 过滤语法： valueConditions='value>95'，过滤会返回没有value的值，就是空的数据，
   *    总数也是包括这些的
   * 5. zwatch 过滤某个label的value：labels=FSType!~rpc_pipefs|tmpfs|rootfs ，
   *    FSType 不是  rpc_pipefs，tmpfs，rootfs
   * 6. 如果没有 过滤，zwatch 的total和 zquery的total是相等的
   * 注意：
   * 1. zwatch 过滤的时候zquery 返回的total是不对的，需要用到过滤那个 metric，
   * 所返回的总数作为总数来使用 ：例如CPUAverageUsedUtilization 的total = CPUAverageUsedUtilizationTotal
   * 2. 默认会返回空的数据，计算在总数 total
   *
    参考：




   */
  async queryZStackMetric1({ type, ...params }: QueryPerformanceArgs) {
    const { extraConditions, conditions, replyWithCount } = params
    const extraConditionsMap = conditionsToObject(extraConditions)

    const accountUuids = extraConditionsMap['accountUuids']

    const resourceMap = {
      [PerformanceType.VmInstance]: {
        resourceType: 'VmInstanceVO',
        tableName: 'vmInstance',
        uuidName: 'VMUuid'
      },
      [PerformanceType.Router]: {
        resourceType: 'VmInstanceVO',
        tableName: 'VirtualRouterVm',
        uuidName: 'VMUuid'
      },
      [PerformanceType.Host]: {
        resourceType: undefined,
        tableName: 'Host',
        uuidName: 'HostUuid'
      },
      [PerformanceType.BackupStorage]: {
        resourceType: undefined,
        tableName: 'BackupStorage',
        uuidName: 'BackupStorageUuid'
      },
      [PerformanceType.L3Network]: {
        resourceType: undefined,
        tableName: 'L3Network',
        uuidName: 'L3NetworkUuid'
      },
      [PerformanceType.Vip]: {
        resourceType: 'VipVO',
        tableName: 'vip',
        uuidName: 'VipUUID'
      }
    }
    const { resourceType, tableName, uuidName } = resourceMap[type]

    let uuids: string[] = []
    if (accountUuids && resourceType) {
      const { inventories: list } = await this.queryAccountResourceRefAction.call({
        conditions: [
          {
            key: 'accountUuid',
            op: Op.in,
            values: accountUuids
          },
          {
            key: 'resourceType',
            op: Op.eq,
            value: resourceType
          }
        ]
      })

      uuids = list.map(l => l.resourceUuid)
    }

    let zqlObj: ZqlObject = {
      tableName
    }
    if (accountUuids && resourceType) {
      zqlObj.condition = {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    }
    zqlObj = QueryConditionTranslator.mergeQueryAction({ conditions, replyWithCount }, zqlObj)
    const { list: sortList, total: sortTotal } = await this.getSortList1(zqlObj, params, uuidName)

    const { list, total: _total } = await this.getZStackMetric1(zqlObj, params, uuidName, sortList)
    const total = sortTotal || _total

    if (sortList.length > 0) {
      const listMap = arrayToMap(list)
      return {
        list: sortList.map(uuid => listMap[uuid]),
        total
      }
    }

    return {
      list,
      total
    }
  }

  async getResourceUUIDList(zqlObj: ZqlObject, conditions: any[]) {
    const _zqlObj = QueryConditionTranslator.mergeQueryAction(
      { conditions, replyWithCount: true },
      zqlObj
    )

    const zql = ZQL.stringify(_zqlObj)

    const {
      results: [{ inventories: _resourceList = [] }]
    } = await this.zqlService.call(zql)

    return _resourceList?.map(({ uuid }) => uuid) ?? []
  }
  /***
   * ui 4.0 按照3.x的 实现方式
   * 搜索步骤：
   * 1. 如果没有 资源限制搜索 按照各自类型的搜索得到uuids ， 如果有资源限制搜索 使用资源限制搜索
   * 2. 使用zwatch 条件搜索zwatch列表 ，对应资源的uuids zwatch 列表
   * 3. 根据排序的列 对zwatch 列表 或者 资源 列表 ，排序 得到 uuids 列表
   * 4. 对得到的uuids列表 进行 分页和过滤操作得到 uuids列表 和 总数
   */
  async queryZStackMetric({ type, ...params }: QueryPerformanceArgs) {
    const { extraConditions, conditions } = params
    const extraConditionsMap = conditionsToObject(extraConditions)

    const accountUuids = extraConditionsMap['accountUuids']
    const resourceUuids = extraConditionsMap['resourceUuids']

    const resourceMap = {
      [PerformanceType.VmInstance]: {
        resourceType: 'VmInstanceVO',
        tableName: 'vmInstance',
        uuidName: 'VMUuid'
      },
      [PerformanceType.Router]: {
        resourceType: 'VmInstanceVO',
        tableName: 'VirtualRouterVm',
        uuidName: 'VMUuid'
      },
      [PerformanceType.Host]: {
        resourceType: undefined,
        tableName: 'Host',
        uuidName: 'HostUuid'
      },
      [PerformanceType.BackupStorage]: {
        resourceType: undefined,
        tableName: 'BackupStorage',
        uuidName: 'BackupStorageUuid'
      },
      [PerformanceType.L3Network]: {
        resourceType: undefined,
        tableName: 'L3Network',
        uuidName: 'L3NetworkUuid'
      },
      [PerformanceType.Vip]: {
        resourceType: 'VipVO',
        tableName: 'vip',
        uuidName: 'VipUUID'
      }
    }
    const { resourceType, tableName, uuidName } = resourceMap[type]

    let uuids: string[] = []
    let hasResCondition = false
    let hasOwnerCondition = false
    if (accountUuids?.length > 0 && resourceType) {
      hasResCondition = true
      hasOwnerCondition = true
      const { inventories: list } = await this.queryAccountResourceRefAction.call({
        conditions: [
          {
            key: 'accountUuid',
            op: Op.in,
            values: accountUuids
          },
          {
            key: 'resourceType',
            op: Op.eq,
            value: resourceType
          }
        ]
      })

      uuids = list.map(l => l.resourceUuid)
    }
    if (resourceUuids?.length > 0) {
      hasResCondition = true
      if (hasOwnerCondition) {
        uuids = _.intersection(uuids, resourceUuids)
      } else {
        uuids = [...uuids, ...resourceUuids]
      }
    }

    const zqlObj: ZqlObject = {
      tableName,
      fields: ['name', 'uuid']
    }

    // 只有 sortBy name 时才加入该 zql 语句，否则会影响 metric 的数据源（没有使用 zql 查询，而是拉取所有进行排序）
    if (params.sortBy === 'name') {
      zqlObj.orderBy = params.sortBy
      zqlObj.orderDirection = params.sortDirection
    }

    if (hasResCondition) {
      zqlObj.condition = {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    }

    // 获取所有的资源列表
    let allResourceUuids = await this.getResourceUUIDList(zqlObj, conditions)
    // 筛选阈值条件 资源列表
    allResourceUuids = await this.filterResourceUUIDListByMetricThreshold(
      tableName,
      uuidName,
      params,
      allResourceUuids
    )

    // 排序资源列表
    allResourceUuids = await this.sortResourceUUIDByMetric(
      tableName,
      uuidName,
      params,
      allResourceUuids
    )

    const { list, total } = await this.combineZStackAndResourceList(
      params,
      allResourceUuids,
      tableName,
      uuidName
    )

    return {
      list,
      total
    }
  }

  getGuestToolsState = async (uuid: string, platform: string, state: string, hostUuid: string) => {
    let toolsState = GuestToolsState.Unsupport
    const resp = await this.querySystemTagAction.call({
      conditions: [
        { key: 'resourceUuid', value: hostUuid },
        { key: 'resourceType', value: 'HostVO' },
        { key: 'tag', op: Op.like, value: 'hostCpuModelName::' }
      ]
    })

    if (
      resp.inventories &&
      resp.inventories[0] &&
      resp.inventories[0].tag.indexOf('aarch64') < 0 &&
      _.includes(['Windows', 'WindowsVirtio', 'Linux'], platform)
    ) {
      toolsState = GuestToolsState.Uninstall
      const guestToolsState = await this.querySystemTagAction.call({
        conditions: [
          { key: 'resourceUuid', value: uuid },
          { key: 'resourceType', value: 'VmInstanceVO' },
          { key: 'tag', op: Op.like, value: 'GuestTools::' }
        ]
      })

      if (guestToolsState.inventories.length) {
        if (state === 'Running') {
          try {
            const toolsInfo = await this.getVmGuestToolsInfoAction.call({
              uuid
            })
            toolsInfo.status === 'Running'
              ? (toolsState = GuestToolsState.IsRunning)
              : (toolsState = GuestToolsState.Stopped)
          } catch (e) {
            toolsState = GuestToolsState.Stopped
          }
        } else {
          toolsState = GuestToolsState.Stopped
        }
      }
    }

    return toolsState
  }

  async queryVpcVRouterPerformances(params) {
    // const { extraConditions, thresholdNum, thresholdSymbol } = params

    const { extraConditions } = params
    const extraConditionsMap = conditionsToObject(extraConditions)

    const accountUuids = extraConditionsMap['accountUuids']
    let uuids: string[]
    if (accountUuids) {
      const { inventories: list } = await this.queryAccountResourceRefAction.call({
        conditions: [
          {
            key: 'accountUuid',
            op: Op.in,
            values: accountUuids
          },
          {
            key: 'resourceType',
            op: Op.eq,
            value: 'VmInstanceVO'
          }
        ]
      })

      uuids = list.map(l => l.uuid)
    }

    let zqlObj: ZqlObject = {
      tableName: 'VirtualRouterVm'
    }

    if (uuids) {
      zqlObj = {
        ...zqlObj,
        condition: {
          uuid: { [ZOp.in]: uuids },
          type: 'ApplianceVm',
          applianceVmType: 'vpcvrouter'
        }
      }
    }
    const { sortBy, sortDirection, ..._params } = params

    const zql = ZQL.stringify(QueryConditionTranslator.mergeQueryAction(_params, zqlObj))

    const {
      results: [{ total, inventories }]
    } = await this.zqlService.call(zql)

    const list = await this.getZStackMetric(
      {
        tableName: 'VirtualRouterVm'
      },
      inventories,
      params,
      PerformanceType.Router
    )

    return {
      list,
      total: list.length
    }
  }

  async queryHostPerformances(params) {
    // const { extraConditions, thresholdNum, thresholdSymbol } = params
    const zqlObj: ZqlObject = {
      tableName: 'host'
    }
    const { sortBy, sortDirection, ..._params } = params

    const zql = ZQL.stringify(QueryConditionTranslator.mergeQueryAction(_params, zqlObj))

    const {
      results: [{ total, inventories }]
    } = await this.zqlService.call(zql)

    const list = await this.getZStackMetric(
      {
        tableName: 'host'
      },
      inventories,
      params,
      PerformanceType.Host
    )

    return {
      list,
      total: list.length
    }
  }

  async queryBackupStoragePerformances(params) {
    // const { extraConditions, thresholdNum, thresholdSymbol } = params

    const zqlObj: ZqlObject = {
      tableName: 'BackupStorage'
    }
    const { sortBy, sortDirection, ..._params } = params

    const zql = ZQL.stringify(QueryConditionTranslator.mergeQueryAction(_params, zqlObj))

    const {
      results: [{ inventories }]
    } = await this.zqlService.call(zql)

    const list = await this.getZStackMetric(
      {
        tableName: 'BackupStorage',
        fields: ['uuid']
      },
      inventories,
      params,
      PerformanceType.BackupStorage
    )

    return {
      list,
      total: list.length
    }
  }

  async queryL3NetworkPerformances(params) {
    // const { extraConditions, thresholdNum, thresholdSymbol } = params

    const zqlObj: ZqlObject = {
      tableName: 'l3network'
    }
    const { sortBy, sortDirection, ..._params } = params

    const zql = ZQL.stringify(QueryConditionTranslator.mergeQueryAction(_params, zqlObj))

    const {
      results: [{ inventories }]
    } = await this.zqlService.call(zql)

    const list = await this.getZStackMetric(
      {
        tableName: 'l3network',
        fields: ['uuid']
      },
      inventories,
      params,
      PerformanceType.L3Network
    )

    return {
      list,
      total: list.length
    }
  }

  async queryVipNetworkPerformances(params) {
    // const { extraConditions, thresholdNum, thresholdSymbol } = params

    const { extraConditions } = params
    const extraConditionsMap = conditionsToObject(extraConditions)

    const accountUuids = extraConditionsMap['accountUuids']
    let uuids: string[]
    if (accountUuids) {
      const { inventories: list } = await this.queryAccountResourceRefAction.call({
        conditions: [
          {
            key: 'accountUuid',
            op: Op.in,
            values: accountUuids
          },
          {
            key: 'resourceType',
            op: Op.eq,
            value: 'VipVO'
          }
        ]
      })

      uuids = list.map(l => l.uuid)
    }

    let zqlObj: ZqlObject = {
      tableName: 'vip'
    }

    if (uuids) {
      zqlObj = {
        ...zqlObj,
        condition: { uuid: { [ZOp.in]: uuids } }
      }
    }
    const { sortBy, sortDirection, ..._params } = params

    const zql = ZQL.stringify(QueryConditionTranslator.mergeQueryAction(_params, zqlObj))

    const {
      results: [{ inventories }]
    } = await this.zqlService.call(zql)

    const list = await this.getZStackMetric(
      {
        tableName: 'vip',
        fields: ['uuid']
      },
      inventories,
      params,
      PerformanceType.Vip
    )

    return {
      list,
      total: list.length
    }
  }

  /**
   *
   * 如果有排序， 先对zwatch 排序 并且分页
   */
  async getSortList1(zqlObj: ZqlObject, params: QueryPerformanceArgs, uuidName) {
    const {
      sortBy: sortMetricName,
      sortDirection,
      limit,
      start,
      thresholdNum,
      thresholdSymbol,
      thresholdMetric
    } = params
    if (sortMetricName && !['createDate', 'name'].includes(sortMetricName)) {
      const { startTime: _startTime, endTime: _endTime } = params
      const startTime = Number(_startTime)
      const endTime = Number(_endTime)
      const period = (endTime - startTime) / 300
      const needFilterMetricName = ['DiskUsedCapacityInPercent', 'VRouterDiskUsedCapacityInPercent']
      const needFilterMetric = needFilterMetricName.includes(sortMetricName)

      const functions = [
        `average(groupBy="${uuidName}")`,
        `sort(by="value",direction="${sortDirection}")`
      ]

      const labels = []
      if (needFilterMetric) {
        labels.push('FSType!~rpc_pipefs|tmpfs|rootfs')
      }

      const valueConditions = []
      let useThresholdTotal = false
      //过滤和排序是一个 Metric
      if (
        thresholdMetric &&
        thresholdSymbol &&
        thresholdNum !== undefined &&
        thresholdMetric === sortMetricName
      ) {
        const op = thresholdSymbol === PerformanceThresholdSymbolType.GreaterEqual ? '>=' : '<='
        valueConditions.push(`value${op}${thresholdNum}`)

        useThresholdTotal = true
      }

      const zwatch: ZwatchObject = {
        metricName: sortMetricName,
        startTime,
        endTime,
        period: period < 1 ? 1 : period,
        labels,
        functions,
        resultName: sortMetricName,
        valueConditions,
        limit,
        start
      }

      const zqlObjMetric: ZqlObject = {
        ...zqlObj,
        returnWith: { zwatch: [zwatch] }
      }

      const zql = ZQL.stringify(zqlObjMetric)
      console.log('zql sort : ', zql)

      const results = await this.zqlService.call(zql)

      const {
        results: [{ returnWith: metric }]
      } = results

      const _list = []
      Object.keys(metric).forEach(metricName => {
        if (Array.isArray(metric[metricName])) {
          metric[metricName].forEach(({ labels }) => {
            const uuid = labels[uuidName]
            _list.push(uuid)
          })
        }
      })
      let total: number
      if (useThresholdTotal) {
        const key = `${thresholdMetric}Total`
        total = metric[key]
      }

      return { list: _list, total }
    }
    return { list: [] }
  }

  async getSortList(
    zqlObj: ZqlObject,
    params: QueryPerformanceArgs,
    list: any[],
    type: PerformanceType
  ) {
    const { sortBy: sortMetricName, sortDirection } = params
    if (sortMetricName && sortMetricName !== 'createDate') {
      /**
       * "query vmInstance.uuid return with (zwatch{resultName='CPUAverageUsedUtilization',metricName='CPUAverageUsedUtilization',startTime=1606819018,endTime=1606819078,period=1,labels='VMUuid=~1a773f60b2a44d7dae3bb958d941a169|f8da0cfd8a164db6adac6522bebc17dc|35e2a382be214a14905d556304d1b329',functions=average(groupBy=\"VMUuid\"),functions=sort(by=\"value\",direction=\"desc\")})"
       *
       *
  ZQLQuery zql="query host.uuid return with (zwatch{resultName='disk usage',metricName='DiskUsedCapacityInPercent',startTime=1606819018,endTime=1606819078,period=1,functions=average(groupBy=\"HostUuid\"),labels='FSType!~rootfs|tmpfs',functions=sort(by=\"value\",direction=\"asc\")})"

       */
      const { startTime: _startTime, endTime: _endTime } = params
      const startTime = Number(_startTime)
      const endTime = Number(_endTime)
      const uuidNameMap = {
        [PerformanceType.VmInstance]: 'VMUuid',
        [PerformanceType.Router]: 'VMUuid',
        [PerformanceType.Host]: 'HostUuid',
        [PerformanceType.BackupStorage]: 'BackupStorageUuid',
        [PerformanceType.L3Network]: 'L3NetworkUuid',
        [PerformanceType.Vip]: 'VipUUID'
      }

      const uuidName = uuidNameMap[type]
      const period = (endTime - startTime) / 300

      const needFilterMetricName = ['DiskUsedCapacityInPercent', 'VRouterDiskUsedCapacityInPercent']
      const needFilterMetric = needFilterMetricName.includes(sortMetricName)

      const functions = [
        `average(groupBy="${uuidName}")`,
        `sort(by="value",direction="${sortDirection}")`
      ]

      const labels = [`${uuidName}=~${list.map(l => l.uuid).join('|')}`]
      if (needFilterMetric) {
        labels.push('FSType!~rpc_pipefs|tmpfs|rootfs')
      }
      const zwatch: ZwatchObject = {
        metricName: sortMetricName,
        startTime,
        endTime,
        period: period < 1 ? 1 : period,
        labels: [`${uuidName}=~${list.map(l => l.uuid).join('|')}`],
        functions,
        resultName: sortMetricName
      }

      const zqlObjMetric: ZqlObject = {
        ...zqlObj,
        returnWith: { zwatch: [zwatch] }
      }

      const results = await this.zqlService.call(ZQL.stringify(zqlObjMetric))

      const {
        results: [{ returnWith: metric }]
      } = results

      const _list = []
      Object.keys(metric).forEach(metricName => {
        metric[metricName].forEach(({ labels }) => {
          const uuid = labels[uuidName]
          const obj = list.find(l => l.uuid === uuid)
          if (obj) {
            _list.push(obj)
          }
        })
      })

      const noDataList = list.filter(l => !_list.includes(l))

      return _list.concat(noDataList)
    }
    return list
  }

  sortUuidList(
    resourceList: any[],
    zwatchList: any[],
    sortBy: string,
    sortDirection: string
  ): string[] {
    let tableList: any[] = []
    if (sortBy === 'name') {
      tableList = resourceList
    } else {
      tableList = zwatchList
    }
    const uuidList = resourceList?.map(({ uuid }) => uuid)
    const table = arrayToMap(tableList)
    return uuidList.sort((uuid1, uuid2) => {
      const it1 = table[uuid1]
      const it2 = table[uuid2]
      if (it1 === undefined && it2 === undefined) {
        return 0
      }
      if (it1 === undefined) {
        return 1
      }
      if (it2 === undefined) {
        return -1
      }
      const a = it1[sortBy] ? it1[sortBy] : -1
      const b = it2[sortBy] ? it2[sortBy] : -1
      if (a === b) {
        return 0
      }
      let result = false
      if (a > b) {
        result = true
      }
      if (sortDirection === 'desc') {
        result = !result
      }

      return result ? 1 : -1
    })
  }

  async combineZStackAndResourceList(
    params: QueryPerformanceArgs,
    resourceList: any[],
    tableName: string,
    uuidName: string
  ) {
    const { limit, start } = params

    const uuids = resourceList?.slice(start, start + limit) ?? []

    // 拿到uuids
    const resouceZqlObj: ZqlObject = {
      tableName,
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    }
    const resouceZql = ZQL.stringify(resouceZqlObj)
    const {
      results: [{ inventories: _resourceList = [] }]
    } = await this.zqlService.call(resouceZql)

    const zwatchZqlObj: ZqlObject = {
      tableName,
      fields: ['uuid']
    }
    // 这里可能有十几个metric，以及同时包含它们的平均值、最大值、最小值
    // 所以pageSize不能过大，否则会导致zql语句超长报错
    const pageSize = 35
    const resourcePages = _.chunk(uuids, pageSize)
    // 分段获取MetricData
    const zwatchPageList = await Promise.all(
      resourcePages.map(async pageUuids => {
        return await this.getMetricData(zwatchZqlObj, params, uuidName, pageUuids)
      })
    )
    const _zwatchList = zwatchPageList.flat()

    const _resourceMap = arrayToMap(_resourceList)
    const _zwatchMap = arrayToMap(_zwatchList)
    const list =
      uuids?.map(uuid => {
        return {
          ..._resourceMap[uuid],
          ..._zwatchMap[uuid]
        }
      }) ?? []

    return {
      list,
      total: resourceList?.length ?? 0
    }
  }

  async sortResourceUUIDByMetric(
    tableName: string,
    uuidName: string,
    params: QueryPerformanceArgs,
    resourceUuids: string[] = []
  ) {
    const { sortBy, sortDirection } = params

    const metrics = []
    if (sortBy && !['createDate', 'name'].includes(sortBy)) {
      metrics.push(sortBy)
    }

    // 没有排序
    if (!metrics.length) {
      return resourceUuids
    }

    const _zqlObj = {
      tableName,
      fields: ['uuid']
    }
    // 这里metrics只需要排序和筛选的而且只拿平均值，所以pageSize可以大一些
    const pageSize = 100
    const resourcePages = _.chunk(resourceUuids, pageSize)
    // 分段获取需要用来排序和筛选的MetricData
    const zwatchPageList = await Promise.all(
      resourcePages.map(async pageUuids => {
        return await this.getMetricData(
          _zqlObj,
          { ...params, metrics, exportMetrics: undefined },
          uuidName,
          pageUuids
        )
      })
    )
    const currentMetric = sortBy

    let _resourceUuids = _.chain(zwatchPageList)
      .flatten()
      .orderBy([currentMetric], [sortDirection])
      .map(metric => metric.uuid)
      .value()

    const noDataUuids = _.difference(resourceUuids, _resourceUuids)

    if (sortDirection === 'asc') {
      _resourceUuids = [...noDataUuids, ..._resourceUuids]
    } else {
      _resourceUuids = [..._resourceUuids, ...noDataUuids]
    }

    return _resourceUuids
  }

  async filterResourceUUIDListByMetricThreshold(
    tableName: string,
    uuidName: string,
    params: QueryPerformanceArgs,
    resourceUuids: string[] = []
  ) {
    const { thresholdMetric, thresholdSymbol, thresholdNum } = params

    const metrics = []

    if (thresholdMetric && thresholdSymbol && thresholdNum !== undefined) {
      metrics.push(thresholdMetric)
    }
    // 没有筛选
    if (!metrics.length) {
      return resourceUuids
    }

    const _zqlObj = {
      tableName,
      fields: ['uuid']
    }
    // 这里metrics只需要排序和筛选的而且只拿平均值，所以pageSize可以大一些
    const pageSize = 100
    const resourcePages = _.chunk(resourceUuids, pageSize)
    // 分段获取需要用来排序和筛选的MetricData
    const zwatchPageList = await Promise.all(
      resourcePages.map(async pageUuids => {
        return await this.getMetricData(
          _zqlObj,
          { ...params, metrics, exportMetrics: undefined },
          uuidName,
          pageUuids
        )
      })
    )

    const flatZwatchPageListMap = _.chain(zwatchPageList).flatten().keyBy('uuid').value()
    const currentMetric = thresholdMetric

    return _.chain(resourceUuids)
      .map(uuid => {
        //对于不存在zwatch的填充 0 比较
        if (!flatZwatchPageListMap[uuid]) {
          return {
            uuid,
            [currentMetric]: 0
          }
        }
        return flatZwatchPageListMap[uuid]
      })
      .filter(metric => {
        const metricValue = metric?.[currentMetric] ?? 0

        const num = Math.floor(metricValue * 100) / 100

        if (thresholdSymbol === PerformanceThresholdSymbolType.GreaterEqual) {
          return num >= Number(thresholdNum)
        }
        return num <= Number(thresholdNum)
      })
      .map(metric => metric.uuid)
      .value()
  }

  async getMetricData(
    zqlObj: ZqlObject,
    params: QueryPerformanceArgs,
    uuidName: string,
    resourceUuids: string[] = []
  ) {
    const {
      startTime: _startTime,
      endTime: _endTime,
      metrics: _metrics,
      exportMetrics,
      replyWithCount
    } = params

    const startTime = Number(_startTime)
    const endTime = Number(_endTime)
    const period = Math.round((endTime - startTime) / 300)

    // 需要过滤label value 的 Metric
    const needFilterMetricName = ['DiskUsedCapacityInPercent', 'VRouterDiskUsedCapacityInPercent']
    let metrics = _metrics.map(metric => ({
      key: metric,
      values: ['average']
    }))
    if (exportMetrics) {
      metrics = exportMetrics
    }

    const zwatch: ZwatchObject[] = _.uniq(metrics)
      .map(metric => {
        const metricName = metric.key
        const needFilterMetric = needFilterMetricName.includes(metricName)
        return metric.values.map(valueFunction => {
          const labels = []
          labels.push(`${uuidName}=~${resourceUuids.join('|')}`)
          if (needFilterMetric) {
            labels.push('FSType!~rpc_pipefs|tmpfs|rootfs')
          }
          const functions = [`${valueFunction}(groupBy="${uuidName}")`]

          const z: ZwatchObject = {
            metricName,
            startTime,
            endTime,
            period: period < 1 ? 1 : period,
            labels,
            functions,
            resultName: `${metricName}|${valueFunction}`
          }

          return z
        })
      })
      .flat()

    zqlObj.condition = {
      uuid: {
        [ZOp.in]: resourceUuids
      }
    }
    zqlObj.returnWith = { zwatch, total: replyWithCount }

    const zql = ZQL.stringify(zqlObj)
    const results = await this.zqlService.call(zql)

    const {
      results: [{ returnWith: metric = {} }]
    } = results

    const valueIndexMap = {
      average: 0,
      top: 1,
      low: 2
    }

    const metricObj: { [key: string]: any } = Object.keys(metric).reduce((p, metricName) => {
      if (Array.isArray(metric[metricName])) {
        metric[metricName].forEach(({ labels, value }) => {
          const uuid = labels[uuidName]
          if (!p[uuid]) {
            p[uuid] = { uuid }
          }
          // 平均值、最大值、最小值以'|'分割拼成字符串返回
          const metricKey = metricName.split('|')[0]
          const metricType = metricName.split('|')[1]
          let metricValueStr = p[uuid][metricKey]
          if (!p[uuid][metricKey]) {
            metricValueStr = '||'
          }
          const metricValueArr = metricValueStr.split('|')
          metricValueArr.splice(valueIndexMap[metricType], 1, value)
          p[uuid][metricKey] = metricValueArr.join('|')
          // 在非导出场景或者只查询平均值的情况下，以原来的形式返回
          const exportMetric = metrics.find(item => item.key === metricKey)
          if (!exportMetrics || _.isEqual(exportMetric.values, ['average'])) {
            p[uuid][metricKey] = value
          }
        })
      }
      return p
    }, {})

    return Object.values(metricObj)
  }

  async getZStackMetric1(
    zqlObj: ZqlObject,
    params: QueryPerformanceArgs,
    uuidName: string,
    sortList: string[] = []
  ) {
    const {
      startTime: _startTime,
      endTime: _endTime,
      metrics,
      thresholdNum,
      thresholdSymbol,
      thresholdMetric,
      limit,
      start,
      replyWithCount,
      sortBy,
      sortDirection
    } = params

    // 已经排序过
    const sortFirst = sortList?.length > 0

    const startTime = Number(_startTime)
    const endTime = Number(_endTime)
    const period = (endTime - startTime) / 300

    // 需要过滤label value 的 Metric
    const needFilterMetricName = ['DiskUsedCapacityInPercent', 'VRouterDiskUsedCapacityInPercent']
    let useThresholdTotal = false
    let _needFilter = false
    const zwatch: ZwatchObject[] = metrics.map(metricName => {
      const needFilterMetric = needFilterMetricName.includes(metricName)

      const labels = []
      if (sortFirst) {
        labels.push(`${uuidName}=~${sortList.join('|')}`)
      }

      if (needFilterMetric) {
        labels.push('FSType!~rpc_pipefs|tmpfs|rootfs')
      }
      const functions = [`average(groupBy="${uuidName}")`]

      const z: ZwatchObject = {
        metricName,
        startTime,
        endTime,
        period: period < 1 ? 1 : period,
        labels,
        functions,
        resultName: metricName
      }

      // 没有过滤 或者 过滤和排序不是一个Metric
      const needFilter = !sortFirst || (sortFirst && thresholdMetric !== sortBy)
      if (needFilter) {
        _needFilter = needFilter
        const valueConditions = []
        //过滤 阈值
        if (
          thresholdMetric &&
          thresholdSymbol &&
          thresholdNum !== undefined &&
          metricName === thresholdMetric
        ) {
          const op = thresholdSymbol === PerformanceThresholdSymbolType.GreaterEqual ? '>=' : '<='
          valueConditions.push(`value${op}${thresholdNum}`)
          useThresholdTotal = true
        }
        z.valueConditions = valueConditions
      }
      return z
    })

    zqlObj.returnWith = { zwatch, total: replyWithCount }

    // 没有排序过 ，而且不用过滤 , 用zql的默认排序和分页
    if (!sortFirst && !_needFilter) {
      zqlObj.limit = limit
      zqlObj.offset = start
      if (sortBy) {
        zqlObj.orderBy = sortBy
      }
      if (sortDirection) {
        zqlObj.orderDirection = sortDirection
      }
    }

    const zql = ZQL.stringify(zqlObj)
    console.log('zql', zql)
    const results = await this.zqlService.call(zql)

    const {
      results: [{ returnWith: metric = {}, inventories = [], total = 0 }]
    } = results
    // const listMap = arrayToMap(inventories)
    let _total: number
    const thresholdList = []
    const metricObj = Object.keys(metric).reduce((p, metricName) => {
      if (Array.isArray(metric[metricName])) {
        metric[metricName].forEach(({ labels, value }) => {
          const uuid = labels[uuidName]
          if (!p[uuid]) {
            p[uuid] = { uuid }
          }
          const metricKey = metricName
          p[uuid][metricKey] = value

          if (_needFilter) {
            thresholdList.push(uuid)
          }
        })
      }
      if (_needFilter) {
        const key = `${thresholdMetric}Total`
        _total = metric[key]
      }
      return p
    }, {})

    // const list = Object.keys(metricObj).map(uuid => {
    //   const zwatch = metricObj[uuid]
    //   return {
    //     ...listMap[uuid],
    //     ...zwatch
    //   }
    // })

    const _list = inventories
      ?.filter(({ uuid }) => {
        if (_needFilter) {
          return thresholdList.includes(uuid)
        }
        return true
      })
      ?.map(inventory => {
        return {
          ...inventory,
          ...metricObj[inventory.uuid]
        }
      })

    // if(!sortList || sortList?.length === 0){
    //   const listMap = arrayToMap(uuid.)

    return {
      list: _list,
      total: _needFilter ? _total : total
    }
  }
  async getZStackMetric(
    zqlObj: ZqlObject,
    _list: any[],
    params: QueryPerformanceArgs,
    type: PerformanceType
  ) {
    if (!_list) {
      return []
    }

    const list = await this.getSortList(zqlObj, params, _list, type)

    const {
      startTime: _startTime,
      endTime: _endTime,
      metrics: _metrics,
      thresholdNum,
      thresholdSymbol,
      thresholdMetric,
      sortBy: sortMetricName,
      sortDirection
    } = params
    const startTime = Number(_startTime)
    const endTime = Number(_endTime)
    const uuidNameMap = {
      [PerformanceType.VmInstance]: 'VMUuid',
      [PerformanceType.Router]: 'VMUuid',
      [PerformanceType.Host]: 'HostUuid',
      [PerformanceType.BackupStorage]: 'BackupStorageUuid',
      [PerformanceType.L3Network]: 'L3NetworkUuid',
      [PerformanceType.Vip]: 'VipUUID'
    }

    const uuidName = uuidNameMap[type]
    const period = (endTime - startTime) / 300

    // fstype :
    // 'rpc_pipefs', 'tmpfs', 'rootfs  [DiskWirte Read ]
    //
    // DiskUsedCapacityInPercent //VRouterDiskUsedCapacityInPercent

    const needFilterMetricName = ['DiskUsedCapacityInPercent', 'VRouterDiskUsedCapacityInPercent']

    const metrics = _metrics.filter(f => !needFilterMetricName.includes(f))
    const zwatch: ZwatchObject[] = metrics.map(metricName => {
      const needFilterMetric = needFilterMetricName.includes(metricName)

      const labels = [`${uuidName}=~${list.map(l => l.uuid).join('|')}`]
      if (needFilterMetric) {
        labels.push('FSType!~rpc_pipefs|tmpfs|rootfs')
      }

      const functions = [`average(groupBy="${uuidName}")`]
      if (sortMetricName === metricName) {
        functions.push(`sort(by="value",direction="${sortDirection}")`)
      }
      // const valueConditions = []
      //过滤 阈值
      // if (thresholdMetric && thresholdSymbol && thresholdNum !== undefined) {
      //   const op = thresholdSymbol === PerformanceThresholdSymbolType.GreaterEqual ? '>=' : '<='
      //   valueConditions.push(`value${op}thresholdNum`)
      // }
      const z: ZwatchObject = {
        metricName,
        startTime,
        endTime,
        period: period < 1 ? 1 : period,
        labels,
        // functions: [`groupBy="${uuidName}"`],
        functions,
        // functions: [`average(groupBy="${uuidName}")`],
        // valueConditions,
        resultName: metricName
      }

      // if (valueConditions) {
      //   z.valueConditions = valueConditions
      // }
      return z
    })

    const zqlObjMetric: ZqlObject = {
      ...zqlObj,
      returnWith: { zwatch }
    }

    const results = await this.zqlService.call(ZQL.stringify(zqlObjMetric))

    const {
      results: [{ returnWith: metric }]
    } = results

    const metricObj = Object.keys(metric).reduce((p, metricName) => {
      metric[metricName].forEach(({ labels, value }) => {
        const uuid = labels[uuidName]
        if (!p[uuid]) {
          p[uuid] = {}
        }
        const metricKey = metricName
        p[uuid][metricKey] = value
      })
      return p
    }, {})

    return list
      .map(l => ({ ...l, ...metricObj[l.uuid] }))
      .filter(f => {
        // 过滤没有zwatch的uuid
        if (!metricObj[f.uuid]) {
          return false
        }
        //过滤 阈值
        if (thresholdMetric && thresholdSymbol && thresholdNum !== undefined) {
          const key = thresholdMetric
          const v = f[key]
          if (thresholdSymbol === PerformanceThresholdSymbolType.GreaterEqual) {
            return v >= thresholdNum
          }
          return v <= thresholdNum
        }
        return true
      })
  }
  async getNeedFilterZStackMetric({
    _metrics,
    startTime,
    endTime,
    period,
    list,
    zqlObj,
    uuidName,
    needFilterMetricName
  }: FilterZStackMetric) {
    const needFilterMetrics = _metrics.filter(f => needFilterMetricName.includes(f))
    if (needFilterMetrics.length > 0) {
      const _zwatch: ZwatchObject[] = needFilterMetrics.map(metricName => {
        const z: ZwatchObject = {
          metricName,
          startTime,
          endTime,
          period: period < 1 ? 1 : period,
          labels: [`${uuidName}=~${list.map(l => l.uuid).join('|')}`],
          // functions: [`groupBy="${uuidName}"`],
          // functions: [`groupBy="${uuidName}"`],

          resultName: metricName
        }
        return z
      })

      const _zqlObjMetric: ZqlObject = {
        ...zqlObj,
        returnWith: { zwatch: _zwatch }
      }

      const _results = await this.zqlService.call(ZQL.stringify(_zqlObjMetric))

      const {
        results: [{ returnWith: metric }]
      } = _results

      // fstype :
      // 'rpc_pipefs', 'tmpfs', 'rootfs  [DiskWirte Read ]
      //
      // DiskUsedCapacityInPercent //VRouterDiskUsedCapacityInPercent
      const filterFsTypes = ['rpc_pipefs', 'tmpfs', 'rootfs']
      let metricObj = Object.keys(metric).reduce((p, metricName) => {
        metric[metricName].forEach(({ labels, value }) => {
          const uuid = labels[uuidName]
          const fsType = labels['FSType']
          // 过滤fstype 的value  metric
          if (fsType && filterFsTypes.includes(fsType)) {
            return
          }
          if (!p[uuid]) {
            p[uuid] = {}
          }
          const metricKey = metricName
          // metricKey 放入数组求平均值
          if (!p[uuid][metricKey]) {
            p[uuid][metricKey] = []
          }
          p[uuid][metricKey].push(value)
        })
        return p
      }, {})

      metricObj = Object.keys(metricObj).reduce((p, uuid) => {
        let metric = metricObj[uuid]

        metric = Object.keys(metric).reduce((_metricObj, metricKey) => {
          const arrMetricValues = metric[metricKey]
          const total = arrMetricValues.length
          if (total === 0) {
            _metricObj[metricKey] = 0
            return _metricObj
          }
          const sum = arrMetricValues.reduce((s, c) => s + c, 0)

          _metricObj[metricKey] = (sum * 1.0) / total
          return _metricObj
        }, {})

        p[uuid] = metric
        return p
      }, {})

      return metricObj
    }

    return null
  }
}
