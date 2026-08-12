import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { compact as _compact, remove as _remove } from 'lodash'

import { Condition, extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryMonitorTemplateAction } from '@/api/zstack/QueryMonitorTemplateAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { QueryMonitorTemplateResp } from '@/maintenance/monitor-template/monitor-template.model'

@Injectable()
export class MonitorTemplateService {
  @Inject() queryMonitorTemplateAction: QueryMonitorTemplateAction
  @Inject() zqlService: ZQLService

  private ruleTemplateNumDataloader
  private monitorGroupNumDataloader

  constructor() {
    this.ruleTemplateNumDataloader = new DataLoader(this._queryRuleTemplateNum)
    this.monitorGroupNumDataloader = new DataLoader(this._queryMonitorGroupNum)
  }

  async queryList(queryArg: IQueryAction): Promise<QueryMonitorTemplateResp> {
    const zqlCondition = this.buildZqlCondition(queryArg.conditions, null)
    const zqlObject = {
      tableName: 'monitorTemplate',
      condition: zqlCondition,
      orderBy: queryArg.sortBy,
      orderDirection: queryArg.sortDirection,
      limit: queryArg.limit,
      offset: queryArg.start,
      returnWith: {
        total: true
      }
    }

    const { results = [] } = await this.zqlService.call(ZQL.stringify(zqlObject))
    const inventories = results?.[0]?.inventories
    const total = results?.[0]?.total

    return {
      list: inventories,
      total
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
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'MonitorTemplateVO')
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

  queryRuleTemplateNum(uuid) {
    return this.ruleTemplateNumDataloader.load(uuid)
  }

  _queryRuleTemplateNum = async (uuids: string[]) => {
    const zqlObjects = [
      {
        action: ZQLAction.COUNT,
        tableName: 'eventRuleTemplate',
        groupBy: 'monitorTemplateUuid',
        condition: {
          monitorTemplateUuid: {
            [ZOp.in]: uuids
          }
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'metricRuleTemplate',
        groupBy: 'monitorTemplateUuid',
        condition: {
          monitorTemplateUuid: {
            [ZOp.in]: uuids
          }
        }
      }
    ]
    const zql = ZQL.multStringify(zqlObjects)
    const resp = await this.zqlService.call(zql)
    return uuids.map(uuid => {
      const eventRules = resp.results[0].inventoryCounts
        ? (resp.results[0].inventoryCounts.find(
            item => item[0].monitorTemplateUuid === uuid
          )?.[1] ?? 0)
        : 0
      const metciRules = resp.results[1].inventoryCounts
        ? (resp.results[1].inventoryCounts.find(
            item => item[0].monitorTemplateUuid === uuid
          )?.[1] ?? 0)
        : 0
      return eventRules + metciRules
    })
  }

  queryMonitorGroupNum(uuid) {
    return this.monitorGroupNumDataloader.load(uuid)
  }

  _queryMonitorGroupNum = async (uuids: string[]) => {
    const zqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'monitorGroupTemplateRef',
      groupBy: 'templateUuid',
      condition: {
        templateUuid: {
          [ZOp.in]: uuids
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    return uuids.map(uuid => {
      return resp.results[0]?.inventoryCounts
        ? (resp.results[0]?.inventoryCounts?.find(item => item[0].templateUuid === uuid)?.[1] ?? 0)
        : 0
    })
  }
}
