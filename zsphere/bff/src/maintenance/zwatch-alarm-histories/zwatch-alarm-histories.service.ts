import { Injectable, Inject } from '@nestjs/common'
import {
  chunk as _chunk,
  cloneDeep as _cloneDeep,
  assign as _assign,
  uniqWith as _uniqWith,
  flatten as _flatten,
  sortBy as _sortBy
} from 'lodash'

import {
  Condition,
  conditionsToObject,
  extractAndRemoveExtraCondition,
  Op
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAlarmRecordAction } from '@/api/zstack/QueryAlarmRecordAction'
import { QueryEventRecordAction } from '@/api/zstack/QueryEventRecordAction'
import { CacheService } from '@/common/cache'
import { EmergencyLevel } from '@/common/enum'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction, ZQLFn } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import {
  AlarmHistories,
  QueryAlarmHistoriesArgs as IQueryAlarmHistoriesArgs
} from '@/maintenance/zwatch-alarm-histories/zwatch-alarm-histories.model'
import { genUuid } from '@/utils'

import { NamespaceToResource } from './query/resource.dataloader'

@Injectable()
export class AlarmHistoriesService {
  @Inject() zqlService: ZQLService
  @Inject() queryAlarmRecordAction: QueryAlarmRecordAction
  @Inject() queryEventRecordAction: QueryEventRecordAction
  @Inject() private cacheService: CacheService

  async getAlarmSummary() {
    const levels = ['Emergent', 'Important', 'Normal']
    const res = await Promise.all(
      levels.map(level =>
        this.queryList({
          conditions: [
            {
              key: 'emergencyLevel',
              op: Op.eq,
              value: level
            },
            {
              key: 'readStatus',
              op: Op.eq,
              value: 'false'
            }
          ]
        })
      )
    )

    return {
      emergent: res?.[0]?.unreadCount,
      important: res?.[1]?.unreadCount,
      normal: res?.[2]?.unreadCount
    }
  }
  queryList = async (queryArg: IQueryAlarmHistoriesArgs) => {
    // 消息内容(已读、未读)
    // 报警级别（严重...）
    // 消息类型（资源、事件）
    // 以上放conditions
    const { conditions = [], ...resArgs } = queryArg

    const conditionsKeys = ['alarmType', 'readStatus', 'isPagination', 'resourceName']
    const conditionsMap = extractAndRemoveExtraCondition(conditions, conditionsKeys)[1]

    const isPagination = conditionsMap['isPagination']?.value ?? false

    if (conditionsMap['readStatus']?.values?.length === 1) {
      conditions.push({
        key: 'readStatus',
        value: (conditionsMap['readStatus']?.values?.[0] === 'true') as any
      })
    }

    let alarmType =
      conditionsMap['alarmType']?.value ?? conditionsMap['alarmType']?.values?.[0] ?? 'all'
    if (conditionsMap['alarmType']?.values?.length === 2) {
      alarmType = 'all'
    }

    const formatItem = (item, type = 'alarm') => {
      const newItem = _cloneDeep(item)
      if (!newItem.dataUuid) {
        newItem['dataUuid'] = genUuid()
      }
      newItem['type'] = type
      newItem['uuid'] = newItem.dataUuid // 初始化uuid有些报警不存在uuid
      newItem['resourceUuid'] = newItem.resourceUuid ?? newItem.resourceId
      newItem['times'] = 1
      newItem['firstTime'] = newItem.createTime

      return newItem
    }

    // 使用Cache缓存第一次获取到的报警消息数据列表。翻页的时候读取缓存数据。
    const cacheKey = await this.cacheService.getCacheKey(AlarmHistoriesService.name, 'getCacheList')
    const cacheList = (await this.cacheService.get(cacheKey)) as AlarmHistoriesService[]
    let currMessageList = []
    const loadCache = !!isPagination && !!cacheList
    if (!loadCache) {
      let formattedHistories = [],
        formettedEvents = []
      switch (alarmType) {
        case 'all':
        case 'alarm': {
          const { inventories: histories = [] } = await this.queryAlarm({
            conditions,
            ...resArgs
          })
          formattedHistories = histories.map(item => formatItem(item, 'alarm'))
          // all 继续走完 event 的处理
          if (alarmType !== 'all') {
            break
          }
        }
        case 'event': {
          const { inventories: events = [] } = await this.queryEvent({
            conditions,
            ...resArgs
          })
          formettedEvents = events.map(item => formatItem(item, 'event'))
          break
        }
        default:
          break
      }
      currMessageList = currMessageList.concat(formattedHistories, formettedEvents)
    }

    currMessageList = currMessageList.sort(
      (item1, item2) => parseInt(item2.createTime, 10) - parseInt(item1.createTime, 10)
    )
    currMessageList =
      currMessageList.length > 1000 ? currMessageList.splice(0, 1000) : currMessageList

    const alarmAndEventKeys = [...this.getSameKeys('alarm'), ...this.getSameKeys('event')]

    const uniqMessage = messageList =>
      _uniqWith<any>(messageList, (pv, cv) => {
        // 计算报警次数
        const rs = alarmAndEventKeys.every(key => pv[key] === cv[key])
        if (rs) {
          cv.times += 1
          cv.firstTime = pv.createTime
        }
        return rs
      })

    currMessageList = uniqMessage(currMessageList)

    if (!isPagination) {
      // 使用Cache缓存第一次获取到的报警消息数据列表。翻页的时候读取缓存数据。
      this.cacheService.set(cacheKey, currMessageList, { ttl: 300 })
      // this.cacheService.set(cacheCountKey, [alarmList, eventList], { ttl: 300 })
    }

    let mergeCurrMessageList = loadCache ? cacheList : currMessageList

    // 处理资源名称搜索，注意是在当前最多1000条的结果中进行二次搜索，否则可能会存在搜索出来的结果没有包含在初始展示的列表中
    if (conditionsMap['resourceName']) {
      const effectiveMessageList = mergeCurrMessageList?.filter(alarm => {
        const { resourceUuid, namespace } = alarm
        return (
          resourceUuid &&
          namespace &&
          NamespaceToResource[namespace] &&
          namespace !== 'ZStack/License'
        )
      })
      const namespaceResourceUuidMap = {}
      effectiveMessageList?.forEach(alarm => {
        const { resourceUuid, namespace } = alarm
        if (namespaceResourceUuidMap?.[namespace]?.length) {
          namespaceResourceUuidMap[namespace].push(resourceUuid)
        } else {
          namespaceResourceUuidMap[namespace] = [resourceUuid]
        }
      })
      const multZqlObject = Object.keys(namespaceResourceUuidMap)?.map(namespace => {
        return {
          tableName: NamespaceToResource[namespace],
          fields: ['uuid', 'name'],
          condition: {
            name: {
              [ZOp.like]: conditionsMap['resourceName']?.value
            },
            uuid: {
              [ZOp.in]: namespaceResourceUuidMap[namespace]
            }
          }
        }
      })
      const zql = ZQL.multStringify(multZqlObject)
      const { results } = await this.zqlService.call(zql)
      const searchResultWithResourceUuidList = _flatten(
        results?.map(it => it?.inventories) || []
      )?.map((resource: any) => resource?.uuid)
      mergeCurrMessageList = _cloneDeep(mergeCurrMessageList)?.filter(alarm =>
        searchResultWithResourceUuidList?.includes(alarm?.resourceUuid)
      )
    }

    if (['time'].includes(queryArg.sortBy)) {
      switch (queryArg.sortDirection) {
        case 'asc':
          mergeCurrMessageList.sort(
            (item1, item2) => parseInt(item2.createTime, 10) - parseInt(item1.createTime, 10)
          )
          break
        case 'desc':
          mergeCurrMessageList.sort(
            (item1, item2) => parseInt(item1.createTime, 10) - parseInt(item2.createTime, 10)
          )
          break
      }
    }

    if (queryArg.sortBy === 'alarmTimes') {
      switch (queryArg.sortDirection) {
        case 'desc':
          mergeCurrMessageList.sort((item1, item2) => item2.times - item1.times)
          break
        case 'asc':
          mergeCurrMessageList.sort((item1, item2) => item1.times - item2.times)
          break
      }
    }

    if (queryArg.sortBy === 'emergencyLevel') {
      switch (queryArg.sortDirection) {
        case 'desc':
          mergeCurrMessageList = _sortBy(mergeCurrMessageList, item =>
            [EmergencyLevel.Emergent, EmergencyLevel.Important, EmergencyLevel.Normal].indexOf(
              item.emergencyLevel
            )
          )
          break
        case 'asc':
          mergeCurrMessageList = _sortBy(mergeCurrMessageList, item =>
            [EmergencyLevel.Normal, EmergencyLevel.Important, EmergencyLevel.Emergent].indexOf(
              item.emergencyLevel
            )
          )
          break
      }
    }

    const messageList = _chunk(mergeCurrMessageList as AlarmHistories[], queryArg.limit ?? 10) // 前端分页 => limit 页数

    // 当前页数据
    const currPageList = messageList[(queryArg.start ?? 0) / (queryArg.limit ?? 30)] ?? [] //取页数

    // const alarmUuids =
    //   currPageList.filter(it => it.type === 'alarm').map(it => it.dataUuid) ??
    //   []
    // const eventUuids =
    //   currPageList.filter(it => it.type === 'event').map(it => it.dataUuid) ??
    //   []

    // let alarmDataList = [],
    //   eventDataList = []
    // // 使用Cache缓存第一次获取到的报警消息数据列表。翻页的时候读取缓存数据。
    // const cacheDetailKey = await this.cacheService.getCacheKey(
    //   AlarmHistoriesService.name,
    //   'getCacheDetailList',
    //   [...alarmUuids, ...eventUuids]
    // )
    // const [cacheAlarmDetailList, cacheEventDetailList] =
    //   ((await this.cacheService.get(
    //     cacheDetailKey
    //   )) as AlarmHistoriesService[]) ?? []
    // const loadDetail =
    //   !!isPagination && !!cacheAlarmDetailList && !!cacheEventDetailList
    // if (!loadDetail) {
    //   if (alarmUuids.length) {
    //     const {
    //       inventories: _alarmDataList = []
    //     } = await this.queryAlarmMessage(
    //       [
    //         {
    //           key: 'dataUuid',
    //           op: Op.in,
    //           values: alarmUuids
    //         }
    //       ],
    //       'alarm'
    //     )
    //     alarmDataList = _alarmDataList
    //   }
    //   if (eventUuids.length) {
    //     const {
    //       inventories: _eventDataList = []
    //     } = await this.queryAlarmMessage(
    //       [
    //         {
    //           key: 'dataUuid',
    //           op: Op.in,
    //           values: eventUuids
    //         }
    //       ],
    //       'event'
    //     )
    //     eventDataList = _eventDataList
    //   }
    //   this.cacheService.set(cacheDetailKey, [alarmDataList, eventDataList], {
    //     ttl: 120
    //   })
    // } else {
    //   alarmDataList = cacheAlarmDetailList as any
    //   eventDataList = cacheEventDetailList as any
    // }

    // const getDetail = async (data: AlarmHistories) => {
    //   const { type } = data
    //   const dataList = type === 'alarm' ? alarmDataList : eventDataList
    //   const item = dataList.find(it => it.dataUuid === data.dataUuid) ?? {}
    //   const times = getTimes(data)

    //   return _assign(data, item, {
    //     createTime: data.createTime,
    //     times
    //   })
    // }

    return {
      list: currPageList || [],
      total: mergeCurrMessageList?.length ?? 0,
      unreadCount: mergeCurrMessageList?.filter(it => !it.readStatus).length || 0
    }
  }

  getConditionExpression(emergencyLevel: string) {
    let conditionExpression
    emergencyLevel === 'all'
      ? (conditionExpression = `((subscriptionUuid = '' and emergencyLevel != 'Normal' and readStatus is not null) or subscriptionUuid != '')`)
      : (conditionExpression = `(subscriptionUuid != '')`)

    return conditionExpression
  }

  zqlByTableName = async (
    tableName: string,
    conditions: Condition[] = [],
    groupByKeys: string[] | string,
    isCount = false,
    limit = 1000
  ) => {
    const zqlCondition = QueryConditionTranslator.translate(conditions)
    const commonObject = {
      condition: zqlCondition,
      limit,
      groupBy: groupByKeys,
      orderBy: 'createTime',
      orderDirection: 'desc' as const
    }

    const zqlObject = Object.assign(
      commonObject,
      isCount
        ? {
            tableName,
            action: ZQLAction.COUNT
          }
        : {
            tableName: `${tableName}.createTime`,
            fnName: ZQLFn.max
          }
    )

    let zql = ZQL.stringify(zqlObject)

    if (
      zql.includes('max(AlarmRecords.createTime)') ||
      zql.includes('max(EventRecords.createTime)')
    ) {
      zql = zql.replace(
        'Records.createTime)',
        `Records.createTime), dataUuid, ${
          Array.isArray(groupByKeys) ? groupByKeys.join(', ') : groupByKeys
        }`
      )
    }
    const { results } = await this.zqlService.call(zql)
    return {
      inventories: (results?.[0]?.inventories as any[]) ?? [],
      inventoryCounts: (results?.[0]?.inventoryCounts as any[]) ?? [],
      total: results?.[0]?.total ?? 0
    }
  }

  getSameKeys = (alarmType: 'alarm' | 'event') => {
    return alarmType === 'alarm'
      ? ['alarmUuid', 'resourceUuid', 'readStatus', 'alarmStatus']
      : ['resourceId', 'subscriptionUuid', 'readStatus', 'labels']
  }

  queryAlarmMessage = async (conditions, type = 'alarm') => {
    let res
    if (type === 'alarm') {
      res = await this.queryAlarmRecordAction.call({ conditions })
    } else {
      res = await this.queryEventRecordAction.call({ conditions })
    }
    return res
  }

  buildQuery1000Zql = ({ conditions, extraConditions, queryType, tableName }) => {
    const baseZqlCondition = QueryConditionTranslator.translate(conditions)
    let zqlCondition = baseZqlCondition
    // 获取资源分组报警器消息
    if (queryType === 'monitorGroupAlarm') {
      const alarmCondition = {
        [tableName === 'AlarmRecords' ? 'alarmUuid' : 'subscriptionUuid']: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'MonitorGroupAlarm',
              fields: ['alarmUuid'],
              condition: {
                groupUuid: conditionsToObject(extraConditions)['groupUuid']
              }
            }
          }
        }
      }
      zqlCondition = { ...alarmCondition, ...baseZqlCondition }
    }
    // 获取通知对象报警器消息
    if (queryType === 'endpointAlarm') {
      const resourceAlarmCondition = {
        alarmUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Alarm',
              fields: ['uuid'],
              condition: {
                'actions.actionUuid': conditionsToObject(extraConditions)['endpointTopicUuid']
              }
            }
          }
        }
      }
      const eventAlarmCondition = {
        subscriptionUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'EventSubscription',
              fields: ['uuid'],
              condition: {
                'actions.actionUuid': conditionsToObject(extraConditions)['endpointTopicUuid'],
                eventName: {
                  [ZOp.ne]: 'ThirdpartyAlert'
                }
              }
            }
          }
        }
      }
      const alarmCondition =
        tableName === 'AlarmRecords' ? resourceAlarmCondition : eventAlarmCondition

      zqlCondition = { ...alarmCondition, ...baseZqlCondition }
    }

    // 全局提示重要资源报警消息
    if (queryType === 'globalAlertAlarm') {
      const extraConditionMap = conditionsToObject(extraConditions)
      const alarmCondition = {
        [ZOp.or]: [
          {
            alarmUuid: {
              [ZOp.in]: conditionsToObject(extraConditions)['alarmUuid']
            }
          },
          ...extraConditionMap['metricItem'].map(item => ({
            [ZOp.and]: {
              namespace: item.split('::')[0],
              metricName: item.split('::')[1]
            }
          }))
        ]
      }
      zqlCondition = { [ZOp.and]: { ...alarmCondition, ...baseZqlCondition } }
    }

    return zqlCondition
  }

  query1000 = async (tableName: string, queryArg: IQueryAlarmHistoriesArgs, limit = 1000) => {
    const { conditions = [], extraConditions = [], type = '' } = queryArg
    const zqlCondition = this.buildQuery1000Zql({
      conditions,
      extraConditions,
      queryType: type,
      tableName
    })
    const zqlObject = {
      tableName,
      condition: zqlCondition,
      limit,
      orderBy: 'createTime',
      orderDirection: 'desc' as const
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    return {
      inventories: (results?.[0]?.inventories as any[]) ?? [],
      total: results?.[0]?.total ?? 0
    }
  }

  queryAlarm = (queryArg: IQueryAlarmHistoriesArgs) => this.query1000('AlarmRecords', queryArg)
  queryEvent = async (queryArg: IQueryAlarmHistoriesArgs) => {
    const { conditions, ...args } = queryArg
    // 事件报警器的resourceUuid字段为 resourceId，需要转换一下。
    const conditionsMap = extractAndRemoveExtraCondition(conditions, ['resourceUuid'])[1]

    if (conditionsMap['resourceUuid']?.value) {
      conditions.push({
        key: 'resourceId',
        op: Op.like,
        value: conditionsMap['resourceUuid']?.value
      })
    }
    return this.query1000('EventRecords', { conditions, ...args })
  }

  countByNamespace = async (conditions: Condition[] = []) => {
    const { inventoryCounts: alarmCountList } = await this.zqlByTableName(
      'AlarmRecords',
      conditions,
      'namespace',
      true
    )
    const { inventoryCounts: eventCountList } = await this.zqlByTableName(
      'EventRecords',
      conditions,
      'namespace',
      true
    )

    const alarmList = alarmCountList.map(([it, alarmCount = 0]) => {
      const eventCount = eventCountList.find(([event]) => event.namespace === it.namespace)
      const [_obj, count = 0] = eventCount ?? []
      return {
        namespace: it.namespace,
        count: alarmCount + count
      }
    })

    const eventList = eventCountList
      .filter(([it]) => alarmCountList.every(([alarm]) => alarm.namespace !== it.namespace))
      .map(([it, eventCount = 0]) => ({
        namespace: it.namespace,
        count: eventCount
      }))

    return {
      list: eventList.concat(alarmList).sort((a, b) => b.count - a.count)
    }
  }
}
