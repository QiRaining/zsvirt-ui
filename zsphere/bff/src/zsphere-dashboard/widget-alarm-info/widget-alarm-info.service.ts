import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { cloneDeep as _cloneDeep, uniq } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetAlarmDataAction } from '@/api/zstack/GetAlarmDataAction'
import { GetCurrentTimeAction } from '@/api/zstack/GetCurrentTimeAction'
import { GetEventDataAction } from '@/api/zstack/GetEventDataAction'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import { QueryAlarmRecordAction } from '@/api/zstack/QueryAlarmRecordAction'
import { QueryEventRecordAction } from '@/api/zstack/QueryEventRecordAction'
import { EmergencyLevel } from '@/common/enum'
import ZQL, { QueryConditionTranslator, ZQLAction, ZOp } from '@/common/zql/index'
import { genUuid } from '@/utils'

import { AlarmResource } from './widget-alarm-info.model'

@Injectable()
export class WidgetAlarmInfoService {
  @Inject()
  zqlService: ZQLService
  @Inject()
  getCurrentTimeAction: GetCurrentTimeAction
  @Inject()
  getAlarmDataAction: GetAlarmDataAction
  @Inject()
  queryAlarmRecordAction: QueryAlarmRecordAction
  @Inject()
  queryEventRecordAction: QueryEventRecordAction
  @Inject()
  getEventDataAction: GetEventDataAction
  @Inject()
  getResourceNamesAction: GetResourceNamesAction

  private getResourceInfoDataloader: DataLoader<string, AlarmResource>

  constructor() {
    this.getResourceInfoDataloader = new DataLoader(this._getResourceInfo)
  }

  // @Cache<any>({ ttl: 9 })
  async getWidgetAlarmInfo(conditions = []) {
    const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60 * 1000
    const currentTimeStamp = Date.now()
    const resp = await this.getCurrentTimeAction.call({})
    const endTime = resp?.currentTime?.MillionSeconds ?? currentTimeStamp
    const startTime = endTime - ONE_WEEK_SECONDS

    const timeConditions = [
      {
        key: 'createTime',
        op: Op.gte,
        value: startTime
      },
      {
        key: 'createTime',
        op: Op.lte,
        value: endTime
      }
    ]

    const alarmResp = await this.queryAlarmRecordAction.call({
      limit: 10,
      sortBy: '-createTime',
      conditions
    })
    const alarmList = alarmResp.inventories ?? []

    const eventResp = await this.queryEventRecordAction.call({
      limit: 10,
      sortBy: '-createTime',
      conditions
    })
    const eventList = eventResp?.inventories ?? []

    const alarmConditions = [...conditions, ...timeConditions]

    const eventConditions = [
      ...conditions,
      ...timeConditions,
      {
        key: 'subscriptionUuid',
        op: Op.ne,
        value: ''
      }
    ]

    const resourceConditions = (key: string) => [
      {
        key: 'namespace',
        op: Op.notIn,
        values: ['ZStack/MN', 'ZStack/License', 'ZStack/System']
      },
      {
        key: 'emergencyLevel',
        op: Op.in,
        values: [EmergencyLevel.Emergent, EmergencyLevel.Important]
      },
      {
        key,
        op: Op.ne,
        value: ''
      }
    ]

    const alarmTotalCountObject = {
      tableName: 'AlarmRecords',
      action: ZQLAction.COUNT,
      groupBy: 'emergencyLevel',
      condition: QueryConditionTranslator.translate(alarmConditions)
    }

    const eventTotalCountObject = {
      tableName: 'EventRecords',
      action: ZQLAction.COUNT,
      groupBy: 'emergencyLevel',
      condition: QueryConditionTranslator.translate(eventConditions)
    }

    const alarmResourceCountObject = {
      tableName: 'AlarmRecords',
      action: ZQLAction.COUNT,
      groupBy: ['emergencyLevel', 'namespace', 'resourceUuid'],
      condition: QueryConditionTranslator.translate([
        ...alarmConditions,
        ...resourceConditions('resourceUuid')
      ])
    }

    const eventResourceCountObject = {
      tableName: 'EventRecords',
      action: ZQLAction.COUNT,
      groupBy: ['emergencyLevel', 'namespace', 'resourceId'],
      condition: QueryConditionTranslator.translate([
        ...eventConditions,
        ...resourceConditions('resourceId')
      ])
    }

    const zql = ZQL.multStringify([
      alarmTotalCountObject,
      eventTotalCountObject,
      alarmResourceCountObject,
      eventResourceCountObject
    ])
    const { results } = await this.zqlService.call(zql)
    const alarmTotalInventoryCounts = results[0]?.inventoryCounts ?? []
    const eventTotalInventoryCounts = results[1]?.inventoryCounts ?? []
    const alarmResourceInventoryCounts = results[2]?.inventoryCounts ?? []
    const eventResourceInventoryCounts = results[3]?.inventoryCounts ?? []

    const getCount = (inventoryCounts: [any, number][], level: EmergencyLevel) => {
      return inventoryCounts.find(item => item[0]?.emergencyLevel === level)?.[1] ?? 0
    }
    const alarmEmergentCount = getCount(alarmTotalInventoryCounts, EmergencyLevel.Emergent)
    const alarmImportantCount = getCount(alarmTotalInventoryCounts, EmergencyLevel.Important)
    const alarmNormalCount = getCount(alarmTotalInventoryCounts, EmergencyLevel.Normal)
    const eventEmergentCount = getCount(eventTotalInventoryCounts, EmergencyLevel.Emergent)
    const eventImportantCount = getCount(eventTotalInventoryCounts, EmergencyLevel.Important)
    const eventNormalCount = getCount(eventTotalInventoryCounts, EmergencyLevel.Normal)

    const resourceCount = new Map<
      string, // map key: uuid__namespace
      { emergent: number; important: number }
    >()

    const setCount = (list: [any, number][], uuidKey: string) => {
      list.forEach(([obj, value]) => {
        const uuid = obj?.[uuidKey]
        const level = obj?.emergencyLevel
        const namespace = obj?.namespace
        if (!uuid || !level || !namespace) {
          return
        }
        const mapKey = `${uuid}__${namespace}`
        let count = resourceCount.get(mapKey)
        if (!count) {
          count = { emergent: 0, important: 0 }
          resourceCount.set(mapKey, count)
        }
        count[level.toLowerCase()] += value
      })
    }
    setCount(alarmResourceInventoryCounts, 'resourceUuid')
    setCount(eventResourceInventoryCounts, 'resourceId')

    const getResourceTotalCount = (count: { emergent: number; important: number }) =>
      count.emergent + count.important

    const top5ResourceList = [...resourceCount.entries()]
      .sort((lhs, rhs) => getResourceTotalCount(rhs[1]) - getResourceTotalCount(lhs[1]))
      .slice(0, 5)
      .map(([mapKey, count]) => {
        const [uuid, namespace] = mapKey.split('__')
        return { uuid, namespace, ...count }
      })

    function formatItem(item, type = 'alarm') {
      const newItem = _cloneDeep(item)
      if (!newItem.dataUuid) {
        newItem['dataUuid'] = genUuid()
      }
      newItem['type'] = type
      newItem['status'] = newItem.readStatus || 'Read'
      newItem.uuid = newItem.dataUuid
      newItem['resourceUuid'] = newItem.resourceUuid ?? newItem.resourceId
      newItem['labels'] = JSON.stringify(newItem.labels, null, 4)?.replace(/\\n/g, '')
      newItem['error'] = JSON.stringify(newItem.error, null, 4)?.replace(/\\n/g, '')
      return newItem
    }

    const newAlarmList = alarmList.map(it => formatItem(it, 'alarm'))
    const newEventList = eventList.map(it => formatItem(it, 'event'))

    const messageList = [...newAlarmList, ...newEventList]
    messageList.sort((c, n) => n.createTime - c.createTime)

    return {
      emergentCount: alarmEmergentCount + eventEmergentCount,
      importantCount: alarmImportantCount + eventImportantCount,
      normalCount: alarmNormalCount + eventNormalCount,
      top5ResourceList,
      latest10List: messageList.slice(0, 10) ?? []
    }
  }

  async getResourceInfo(uuid: string) {
    return this.getResourceInfoDataloader.load(uuid)
  }

  private _getResourceInfo = async (uuids: string[]) => {
    const resp = await this.getResourceNamesAction.call({ uuids: uniq(uuids) })
    const list = resp.inventories ?? []
    const map = new Map(list.map(item => [item.uuid, item]))
    const vmList = list.reduce((prev, curr) => {
      if (curr?.resourceType === 'VmInstanceVO') {
        prev.push(curr.uuid)
      }
      return prev
    }, [])
    const vmStateMap = new Map()
    if (vmList.length) {
      const resp = await this.zqlService.call(
        ZQL.stringify({
          tableName: 'VmInstance',
          fields: ['uuid', 'state'],
          condition: {
            uuid: {
              [ZOp.in]: uniq(vmList)
            }
          }
        })
      )
      resp?.results?.[0]?.inventories?.forEach(item => {
        vmStateMap.set(item.uuid, item.state)
      })
    }
    return uuids.map(uuid => {
      const item = map.get(uuid)
      if (!item) {
        return null
      }
      return {
        ...item,
        state: vmStateMap.get(uuid)
      }
    })
  }
}
