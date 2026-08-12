import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  map as _map,
  remove as _remove,
  cloneDeep as _cloneDeep,
  compact as _compact
} from 'lodash'

import {
  QueryParam,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition,
  Condition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryMonitorGroupAction } from '@/api/zstack/QueryMonitorGroupAction'
import { QueryMonitorGroupInstanceAction } from '@/api/zstack/QueryMonitorGroupInstanceAction'
import { QueryMonitorGroupTemplateRefAction } from '@/api/zstack/QueryMonitorGroupTemplateRefAction'
import { QueryMonitorTemplateAction } from '@/api/zstack/QueryMonitorTemplateAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction, ZQLFn } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@Injectable()
export class MonitorGroupService extends ActionService {
  @Inject() queryMonitorGroupAction: QueryMonitorGroupAction
  @Inject() queryMonitorGroupInstanceAction: QueryMonitorGroupInstanceAction
  @Inject()
  queryMonitorGroupTemplateRefAction: QueryMonitorGroupTemplateRefAction
  @Inject() queryMonitorTemplateAction: QueryMonitorTemplateAction
  @Inject() zqlService: ZQLService

  private monitorGroupTemplateDataloader
  private instanceStatisticsDataloader

  constructor() {
    super()
    this.monitorGroupTemplateDataloader = new DataLoader(this._getMonitorGroupTemplate)
    this.instanceStatisticsDataloader = new DataLoader(this._getMonitorGroupInstanceStatistics)
  }

  async monitorGroupList(params) {
    const clone: IQueryAction = JSON.parse(JSON.stringify(params))
    const { type = 'normal' } = clone

    let zqlCondition = null
    switch (type) {
      case 'QueryForMonitorTemplate':
        zqlCondition = this.buildQueryForMonitorTemplateCondtion(params.extraConditions)
        break
      case 'QueryForAttachMonitorTemplate':
        zqlCondition = this.buildQueryForAttachMonitorTemplateCondtion(params.extraConditions)
        break
    }

    // 处理tag表头过滤
    const { conditions, ..._params } = params
    const _conditions = _cloneDeep(conditions)
    _remove(_conditions, (condition: Condition) => condition?.key === 'tag')

    const finalZqlCondition = this.buildZqlCondition(_conditions, zqlCondition)

    return await this.getMonitorGroupList(params, finalZqlCondition)
  }

  async getMonitorGroupList(param: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'monitorGroup',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const { results = [] } = await this.zqlService.call(ZQL.stringify(zqlObject))
    const inventories = results?.[0]?.inventories
    const total = results?.[0]?.total

    inventories.map(item => {
      if (item?.actions) {
        item.actions = JSON.parse(item.actions)
      }
    })
    return {
      total,
      list: inventories
    }
  }

  buildZqlCondition(conditions: Condition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName',
      '__tagUuid__'
    ])

    const specicalCondition = []

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'MonitorGroupVO')
      )
    }

    if (_extraConditionMap['__tagUuid__']) {
      const tagQueryOp = _extraConditionMap['__tagUuid__'].op
      if (['in', 'notIn'].indexOf(tagQueryOp) !== -1) {
        const tagFilterUuids = _extraConditionMap['__tagUuid__'].values
        if (tagFilterUuids?.filter(t => t === '__null__')?.length === 0) {
          specicalCondition.push({
            __tagUuid__: {
              [ZOp[tagQueryOp]]: {
                [ZOp.query]: {
                  tableName: 'UserTag',
                  fields: ['tagPatternUuid'],
                  condition: {
                    tagPatternUuid: {
                      [ZOp.in]: tagFilterUuids
                    }
                  }
                }
              }
            }
          })
        } else {
          //Null和正常标签
          specicalCondition.push({
            [ZOp.or]: [
              {
                __tagUuid__: {
                  [ZOp.notIn]: {
                    [ZOp.query]: {
                      tableName: 'UserTag',
                      fields: ['tagPatternUuid']
                    }
                  }
                }
              },
              {
                __tagUuid__: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'UserTag',
                      fields: ['tagPatternUuid'],
                      condition: {
                        tagPatternUuid: {
                          [ZOp.in]: tagFilterUuids.filter(t => t !== '__null__')
                        }
                      }
                    }
                  }
                }
              }
            ]
          })
        }
      } else {
        specicalCondition.push({
          __tagUuid__: {
            [ZOp[tagQueryOp]]: _extraConditionMap['__tagUuid__'].value
          }
        })
      }
    }
    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  buildQueryForMonitorTemplateCondtion(extraConditions) {
    const extraConditionsMap = conditionsToObject(extraConditions)
    const templateUuid = extraConditionsMap['templateUuid']
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'MonitorGroupTemplateRef',
            fields: 'groupUuid',
            condition: {
              templateUuid: templateUuid
            }
          }
        }
      }
    }
  }

  buildQueryForAttachMonitorTemplateCondtion(extraConditions) {
    const extraConditionsMap = conditionsToObject(extraConditions)
    const templateUuid = extraConditionsMap['templateUuid']
    return {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'MonitorGroupTemplateRef',
            fields: 'groupUuid',
            condition: {
              templateUuid: templateUuid
            }
          }
        }
      }
    }
  }

  async monitorGroupInstanceList(params) {
    const clone: QueryParam = JSON.parse(JSON.stringify(params))
    const { total, inventories } = await this.queryMonitorGroupInstanceAction.call(clone)
    await Promise.all(
      inventories.map(async item => {
        const tableName = item?.instanceResourceType.split('VO')[0]
        const multZql = [
          {
            tableName: tableName,
            condition: {
              uuid: item.instanceUuid
            }
          }
        ]
        const zql = ZQL.multStringify(multZql)
        const { results = [] } = await this.zqlService.call(zql)
        item.instance = results?.[0]?.inventories?.[0]
      })
    )
    return {
      total,
      list: inventories
    }
  }

  async queryResourceInstance(params) {
    const { type, conditions, extraConditions } = params
    const multZql = [
      {
        tableName: type,
        fields: ['uuid', 'name'],
        condition: {
          ...QueryConditionTranslator.translate(conditions),
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'MonitorGroupInstance',
                fields: ['instanceUuid'],
                condition: {
                  groupUuid: conditionsToObject(extraConditions)['groupUuid']
                }
              }
            }
          }
        },
        returnWith: {
          total: true
        }
      }
    ]
    const zql = ZQL.multStringify(multZql)
    const { results = [] } = await this.zqlService.call(zql)
    return {
      total: results?.[0]?.total,
      list: results?.[0]?.inventories
    }
  }

  getMonitorGroupTemplate(uuid) {
    return this.monitorGroupTemplateDataloader.load(uuid)
  }

  _getMonitorGroupTemplate = async (uuids: string[]) => {
    const { inventories } = await this.queryMonitorGroupTemplateRefAction.call({
      conditions: [
        {
          key: 'groupUuid',
          op: Op.in,
          values: uuids
        }
      ]
    })
    const templateUuids = _map(inventories, 'templateUuid')
    const res = await this.queryMonitorTemplateAction.call({
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: templateUuids
        }
      ]
    })
    const union = []
    inventories.map(item => {
      res?.inventories?.map(it => {
        if (it?.uuid === item?.templateUuid) {
          union.push({ groupUuid: item.groupUuid, template: it })
        }
      })
    })
    return uuids.map(uuid => {
      const res = union.find(item => item.groupUuid === uuid)
      if (res) {
        return res.template
      } else {
        return null
      }
    })
  }

  getMonitorGroupInstanceStatistics(uuid) {
    return this.instanceStatisticsDataloader.load(uuid)
  }

  _getMonitorGroupInstanceStatistics = async (uuids: string[]) => {
    const totalZqlObjectList = uuids.map(uuid => ({
      action: ZQLAction.COUNT,
      tableName: 'MonitorGroupInstance',
      condition: {
        groupUuid: uuid
      }
    }))
    const { results: totalResults = [] } = await this.zqlService.call(
      ZQL.multStringify(totalZqlObjectList)
    )

    const unhealthyZqlObjectList = uuids.map(uuid => ({
      action: ZQLAction.COUNT,
      tableName: 'MonitorGroupInstance',
      condition: {
        groupUuid: uuid,
        status: 'Alarm'
      }
    }))
    const { results: unhealthyCountResults = [] } = await this.zqlService.call(
      ZQL.multStringify(unhealthyZqlObjectList)
    )

    const instanceTypeCountZqlObjectList = uuids.map(uuid => ({
      action: ZQLAction.COUNT,
      fnName: ZQLFn.distinct,
      fields: ['instanceResourceType'],
      tableName: 'MonitorGroupInstance',
      condition: {
        groupUuid: uuid
      }
    }))
    const { results: instanceTypeCountResults = [] } = await this.zqlService.call(
      ZQL.multStringify(instanceTypeCountZqlObjectList)
    )

    return uuids.map((uuid, index) => {
      return {
        instanceTotal: totalResults[index]?.total || 0,
        instanceTypeCount: instanceTypeCountResults[index]?.total || 0,
        unhealthyInstanceCount: unhealthyCountResults[index]?.total || 0
      }
    })
  }
}
