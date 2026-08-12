import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get, compact as _compact } from 'lodash'

import {
  Condition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { HostGroupQueryType } from './host-group.model'

@Injectable()
export class HostGroupService extends ActionService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const { type = HostGroupQueryType.Normal, extraConditions = [] } = params
    const baseConditions = []
    // const _zqlCondition = QueryConditionTranslator.translate(
    //   params.conditions.concat(baseConditions)
    // )
    let _extraZqlConditions
    let _resultResp = null

    const conditionsMap = conditionsToObject(extraConditions) as any

    switch (type) {
      case HostGroupQueryType.Normal:
        break
      default:
        break
    }

    const zqlCondition = this.buildZqlCondition(
      params.conditions.concat(baseConditions),
      _extraZqlConditions
    )

    _resultResp = await this.getHostGroupList(params, zqlCondition)

    return _resultResp
  }

  async getHostGroupList(param: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'HostSchedulingRuleGroup',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    console.log('zql===', zql)
    const { results } = await this.zqlService.call(zql)
    const hostGroups = results?.[0]?.inventories || []
    const total = results?.[0]?.total || 0

    // 获取关联的云主机调度策略
    if (total > 0) {
      hostGroups?.map(hostGroup => {
        hostGroup.associatedVmSchedulingRuleList = []
        hostGroup.vmSchedulingRuleCount = 0
      })
      const hostGroupUuids = hostGroups?.map(hostGroup => hostGroup?.uuid)
      // 获取当前所有物理机调度组关联的所有云主机调度策略
      const zqlLocalObj: ZqlObject = {
        tableName: 'VmSchedulingRule',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VmSchedulingRuleRef',
                fields: ['vmSchedulingRuleUuid'],
                condition: {
                  hostGroupUuid: {
                    [ZOp.in]: hostGroupUuids
                  }
                }
              }
            }
          }
        },
        returnWith: {
          total: true
        }
      }
      const {
        results: [{ inventories: vmSchedulingRuleInventories, total: vmSchedulingRuleTotal }]
      } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))

      if (vmSchedulingRuleTotal > 0) {
        const vmSchedulingRuleUuids = vmSchedulingRuleInventories?.map(
          vmSchedulingRule => vmSchedulingRule?.uuid
        )
        // 查询ref表，获取物理机调度组和云主机调度策略的对应关系
        const relatedZqlObject = {
          tableName: 'VmSchedulingRuleRef',
          fields: ['vmSchedulingRuleUuid', 'hostGroupUuid'],
          condition: {
            vmSchedulingRuleUuid: {
              [ZOp.in]: vmSchedulingRuleUuids
            }
          },
          returnWith: {
            total: true
          }
        }
        const {
          results: [{ inventories: relatedInventories, total }]
        } = await this.zqlService.call(ZQL.stringify(relatedZqlObject))
        if (total > 0) {
          // 将物理机调度组与云主机调度策略 一对多 关联起来
          hostGroups?.map(hostGroup => {
            const vmSchedulingRuleUuids = relatedInventories
              ?.filter(relatedItem => hostGroup?.uuid === relatedItem?.hostGroupUuid)
              ?.map(it => it?.vmSchedulingRuleUuid)
            if (vmSchedulingRuleUuids?.length) {
              const vmSchedulingRules = vmSchedulingRuleInventories?.filter(vmSchedulingRule =>
                vmSchedulingRuleUuids.includes(vmSchedulingRule?.uuid)
              )
              vmSchedulingRules?.map(vmSchedulingRule => (vmSchedulingRule.hostGroup = hostGroup))
              hostGroup.associatedVmSchedulingRuleList = vmSchedulingRules
            }
          })
        }
      }
    }

    return {
      list: hostGroups,
      total: total
    }
  }

  buildZqlCondition(conditions: Condition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName'
    ])

    const specicalCondition = []

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'HostGroupVO')
      )
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async getHostCount(hostGroup) {
    const zqlLocalObj: ZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'Host',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostSchedulingRuleGroupRef',
              fields: ['hostUuid'],
              condition: {
                hostGroupUuid: hostGroup?.uuid
              }
            }
          }
        }
      }
    }
    const {
      results: [{ total = 0 }]
    } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))

    return total
  }

  async getVmSchedulingRuleCount(hostGroup) {
    const zqlLocalObj: ZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'VmSchedulingRule',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VmSchedulingRuleRef',
              fields: ['vmSchedulingRuleUuid'],
              condition: {
                hostGroupUuid: hostGroup?.uuid
              }
            }
          }
        }
      }
    }
    const {
      results: [{ total = 0 }]
    } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))

    return total
  }
}
