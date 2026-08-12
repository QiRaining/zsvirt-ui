import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  get as _get,
  cloneDeep as _cloneDeep,
  startsWith as _startsWith,
  concat as _concat,
  uniq as _uniq,
  chunk as _chunk
} from 'lodash'

import { Op, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAlarmAction } from '@/api/zstack/QueryAlarmAction'
import { QueryEventSubscriptionAction } from '@/api/zstack/QueryEventSubscriptionAction'
import { QueryMonitorGroupAlarmAction } from '@/api/zstack/QueryMonitorGroupAlarmAction'
import { QueryThirdpartyPlatformAction } from '@/api/zstack/QueryThirdpartyPlatformAction'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { AlarmLabels, ZWatchAlarmQueryType } from '@/maintenance/zwatch-alarm/zwatch.alarm.model'

@Injectable()
export class ZWatchAlarmQueryService {
  @Inject()
  zqlService: ZQLService
  @Inject()
  queryAlarmAction: QueryAlarmAction
  @Inject()
  queryEventSubscriptionAction: QueryEventSubscriptionAction
  @Inject() queryMonitorGroupAlarmAction: QueryMonitorGroupAlarmAction
  @Inject() queryThirdpartyPlatformAction: QueryThirdpartyPlatformAction

  private dataloader
  private countDataloader

  private sourceMap: any = {}

  constructor() {
    this.dataloader = new DataLoader(this._getThirdpartyPlatformName)
    this.countDataloader = new DataLoader(this._getFilteredAlarmResourceCount)
  }

  queryZWatchAlarm(params) {
    const cloneParams = _cloneDeep(params)
    const { type = ZWatchAlarmQueryType.Resource } = cloneParams
    const _resultResp = this.getZwatchAlarm(cloneParams, type)
    return _resultResp
  }

  getZwatchAlarm = async (params, type = ZWatchAlarmQueryType.Resource) => {
    const { conditions = [], extraConditions = [] } = params
    const extraConditionMap = conditionsToObject(extraConditions)

    if (extraConditionMap['resourceUuid']) {
      conditions.push({
        key: 'labels.value',
        op: Op.like,
        value: extraConditionMap['resourceUuid']
      })
    }

    const genZql = (uuid: string) => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'SNSApplicationEndpoint',
        condition: {
          'topics.uuid': {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'AlarmAction',
                fields: 'actionUuid',
                condition: {
                  alarmUuid: uuid
                }
              }
            }
          }
        }
      }
    }
    const genEventZql = (uuid: string) => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'SNSApplicationEndpoint',
        condition: {
          'topics.uuid': {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'EventSubscriptionAction',
                fields: 'actionUuid',
                condition: {
                  subscriptionUuid: uuid
                }
              }
            }
          }
        }
      }
    }

    const getResourceAlarm = async (params, type: ZWatchAlarmQueryType) => {
      const { conditions = [], start, limit, sortBy, sortDirection } = params
      const conditionMap = conditionsToObject(conditions)
      let zqlConditions: any = {}
      let _conditions = _cloneDeep(conditions)
      // 处理搜索输入首字母是 s 时, zql 查询报错
      const searchZhNameValue = conditionMap['__systemTag__']
      const searchEnNameValue = conditionMap['name']
      if (searchZhNameValue || searchEnNameValue) {
        _conditions = _cloneDeep(conditions)?.filter(
          it => !['name', '__systemTag__'].includes(it?.key)
        )
        if (searchZhNameValue) {
          zqlConditions = {
            __systemTag__: {
              [ZOp.like]: _startsWith(searchZhNameValue, 's')
                ? `name::cn::%\\${searchZhNameValue}%`
                : `name::cn::%${searchZhNameValue}%`
            }
          }
        }
        if (searchEnNameValue) {
          zqlConditions = {
            name: {
              [ZOp.like]: _startsWith(searchEnNameValue, 's')
                ? `\\${searchEnNameValue}`
                : searchEnNameValue
            }
          }
        }
      }
      if (type === ZWatchAlarmQueryType.Event) {
        _conditions.push({
          key: 'eventName',
          op: Op.ne,
          value: 'ThirdpartyAlert'
        })
      }
      if (Array.isArray(conditionMap['namespace'])) {
        if (
          conditionMap['namespace'].includes('ZStack/DisasterRecoveryStorage') &&
          !conditionMap['namespace'].includes('ZStack/BackupStorage')
        ) {
          _conditions = _conditions.filter(item => item.key !== 'namespace')
          zqlConditions = {
            ...zqlConditions,
            [ZOp.or]: {
              namespace: {
                [ZOp.in]: conditionMap['namespace']
              },
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'SystemTag',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType:
                        type === ZWatchAlarmQueryType.Resource ? 'AlarmVO' : 'EventSubscriptionVO',
                      tag: 'resourceName::DisasterRecoveryStorage'
                    }
                  }
                }
              }
            }
          }
        } else if (
          !conditionMap['namespace'].includes('ZStack/DisasterRecoveryStorage') &&
          conditionMap['namespace'].includes('ZStack/BackupStorage')
        ) {
          zqlConditions = {
            ...zqlConditions,
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'SystemTag',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType:
                      type === ZWatchAlarmQueryType.Resource ? 'AlarmVO' : 'EventSubscriptionVO',
                    tag: 'resourceName::DisasterRecoveryStorage'
                  }
                }
              }
            }
          }
        }
      }
      const zqlObj: ZqlObject = {
        tableName: type === ZWatchAlarmQueryType.Resource ? 'Alarm' : 'EventSubscription',
        condition: _conditions?.length
          ? QueryConditionTranslator.translate(_conditions, zqlConditions)
          : zqlConditions,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit,
        offset: start,
        returnWith: {
          total: true
        }
      }
      console.log('zql===', ZQL.stringify(zqlObj))
      const { results } = await this.zqlService.call(ZQL.stringify(zqlObj))
      return {
        inventories: results?.[0]?.inventories || [],
        total: results?.[0]?.total || 0
      }
    }

    const getMontitorGroupAlarmList = async params => {
      const { conditions = [], extraConditions = [] } = params
      const zqlConditions = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName:
                params?.type === ZWatchAlarmQueryType.MonitorGroupResource
                  ? 'MonitorGroupAlarm'
                  : 'MonitorGroupEventSubscription',
              fields:
                params?.type === ZWatchAlarmQueryType.MonitorGroupResource
                  ? 'alarmUuid'
                  : 'eventSubscriptionUuid',
              condition: {
                groupUuid: conditionsToObject(extraConditions)['groupUuid']
              }
            }
          }
        }
      }
      const zqlObj: ZqlObject = {
        tableName:
          params?.type === ZWatchAlarmQueryType.MonitorGroupResource
            ? 'Alarm'
            : 'EventSubscription',
        condition: conditions?.length
          ? QueryConditionTranslator.translate(conditions, zqlConditions)
          : zqlConditions,
        returnWith: {
          total: true
        }
      }
      const { results } = await this.zqlService.call(ZQL.stringify(zqlObj))
      return {
        inventories: results?.[0]?.inventories || [],
        total: results?.[0]?.total || 0
      }
    }

    const getAlarmListForZwatchEndpointAddAlarm = async params => {
      const { conditions = [], extraConditions = [] } = params
      const alarmType = conditionsToObject(extraConditions)?.['alarmType']
      const tableName = alarmType === ZWatchAlarmQueryType.Resource ? 'Alarm' : 'EventSubscription'
      let _condition = {}
      if (alarmType === ZWatchAlarmQueryType.Thirdparty) {
        _condition = {
          eventName: 'ThirdpartyAlert'
        }
      }
      if (alarmType === ZWatchAlarmQueryType.Event) {
        _condition = {
          eventName: {
            [ZOp.ne]: 'ThirdpartyAlert'
          }
        }
      }
      const zqlConditions = {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName,
              fields: 'uuid',
              condition: {
                'actions.actionUuid': conditionsToObject(params?.extraConditions)?.['actionUuid']
              }
            }
          }
        },
        ..._condition
      }
      const zqlObj: ZqlObject = {
        tableName,
        condition: conditions?.length
          ? QueryConditionTranslator.translate(conditions, zqlConditions)
          : zqlConditions,
        orderBy: params.sortBy,
        orderDirection: params.sortDirection,
        limit: params.limit,
        offset: params.start,
        returnWith: {
          total: true
        }
      }
      const { results } = await this.zqlService.call(ZQL.stringify(zqlObj))
      return {
        inventories: results?.[0]?.inventories || [],
        total: results?.[0]?.total || 0
      }
    }

    let baseResp = null
    switch (type) {
      case ZWatchAlarmQueryType.Resource:
        baseResp = await getResourceAlarm(params, ZWatchAlarmQueryType.Resource)
        break
      case ZWatchAlarmQueryType.Event:
        baseResp = await getResourceAlarm(params, ZWatchAlarmQueryType.Event)
        break
      case ZWatchAlarmQueryType.Thirdparty:
        conditions.push({
          key: 'eventName',
          op: Op.eq,
          value: 'ThirdpartyAlert'
        })
        baseResp = await this.queryEventSubscriptionAction.call(params)
        break
      case ZWatchAlarmQueryType.MonitorGroupEvent:
      case ZWatchAlarmQueryType.MonitorGroupResource:
        baseResp = await getMontitorGroupAlarmList(params)
        break
      case ZWatchAlarmQueryType.ZwatchEndpoint:
        baseResp = await getAlarmListForZwatchEndpointAddAlarm(params)
      default:
        break
    }
    const resultList = _get(baseResp, ['inventories'], [])

    const batchZqlStr = ZQL.multStringify(
      resultList.map(it =>
        [ZWatchAlarmQueryType.Resource, ZWatchAlarmQueryType.MonitorGroupResource].includes(type)
          ? genZql(it.uuid)
          : genEventZql(it.uuid)
      )
    )
    let batchTopicNumResp = {}
    try {
      batchTopicNumResp = await this.zqlService.call(batchZqlStr || '')
    } catch (error) {
      console.error(error)
    }
    resultList?.forEach((item, index) => {
      item['topicNum'] = _get(batchTopicNumResp, ['results', index, 'total'], 0)
    })

    return {
      list: resultList,
      total: baseResp.total || 0
    }
  }

  async getThirdpartyPlatformName(uuid, platformUuid) {
    this.sourceMap[uuid] = {
      uuid,
      platformUuid
    }
    return this.dataloader.load(uuid)
  }

  _getThirdpartyPlatformName = async (uuids: string[]) => {
    const platformUuids = uuids.map(uuid => this.sourceMap[uuid].platformUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: platformUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.queryThirdpartyPlatformAction.call(params)
    const list = resp?.inventories ?? []
    return uuids.map(uuid => {
      const target = list.find(target => target.uuid === this.sourceMap[uuid]?.platformUuid)
      if (target) {
        return target
      } else {
        return '-'
      }
    })
  }

  async getFilteredAlarmResourceCount(uuid: string, labels: AlarmLabels[]) {
    return this.countDataloader.load({ uuid, labels })
  }

  private _getFilteredAlarmResourceCount = async (
    requests: { uuid: string; labels: AlarmLabels[] }[]
  ): Promise<number[]> => {
    // 1. 从请求中提取标签并处理VM UUID
    const vmUuidsMap = this._extractVmUuidsFromLabels(requests)

    // 2. 构建批量查询
    const queries = this._buildVmQueries(vmUuidsMap)

    // 3. 执行查询并处理结果
    const { results = [] } = await this.zqlService.call(ZQL.multStringify(queries))

    // 4. 统计结果
    const countMap = this._calculateTotalCounts(results, vmUuidsMap)

    // 5. 返回结果数组
    return requests.map(request => countMap[request.uuid] || 0)
  }

  private _extractVmUuidsFromLabels(
    requests: { uuid: string; labels: AlarmLabels[] }[]
  ): Record<string, string[]> {
    const vmUuidsMap: Record<string, string[]> = {}

    requests.forEach(({ uuid, labels }) => {
      const vmUuids = labels
        .map(label => label.value)
        .filter(Boolean)
        .flatMap(value => value.split('|'))

      vmUuidsMap[uuid] = _uniq(vmUuids)
    })

    return vmUuidsMap
  }

  private _buildVmQueries(vmUuidsMap: Record<string, string[]>) {
    const queries: any[] = []

    Object.entries(vmUuidsMap).forEach(([alarmUuid, vmUuids]) => {
      if (!vmUuids.length) {
        return
      }

      vmUuids.forEach(vmUuid => {
        queries.push({
          action: ZQLAction.COUNT,
          tableName: 'vmInstance',
          condition: {
            uuid: {
              [ZOp.eq]: vmUuid,
              [ZOp.notIn]: {
                [ZOp.and]: [
                  {
                    uuid: {
                      [ZOp.notIn]: {
                        [ZOp.and]: {
                          [ZOp.query]: {
                            tableName: 'templatedVminstance',
                            fields: ['uuid']
                          }
                        }
                      }
                    }
                  },
                  {
                    uuid: {
                      [ZOp.notIn]: {
                        [ZOp.and]: {
                          [ZOp.query]: {
                            tableName: 'templatedVminstanceCache',
                            fields: ['cacheVmInstanceUuid']
                          }
                        }
                      }
                    }
                  }
                ]
              }
            },
            state: {
              [ZOp.ne]: 'Destroyed'
            }
          },
          namedAs: `${alarmUuid}|${vmUuid}`
        })
      })
    })

    return queries
  }

  private _calculateTotalCounts(
    results: Array<{ name: string; total: number }>,
    vmUuidsMap: Record<string, string[]>
  ): Record<string, number> {
    const countMap: Record<string, number> = {}

    Object.keys(vmUuidsMap).forEach(alarmUuid => {
      countMap[alarmUuid] = 0
    })

    results.forEach(result => {
      const [alarmUuid] = result.name.split('|')
      if (alarmUuid) {
        countMap[alarmUuid] += result.total || 0
      }
    })

    return countMap
  }
}
