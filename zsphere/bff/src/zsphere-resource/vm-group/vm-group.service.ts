import { Inject, Injectable } from '@nestjs/common'
import { compact as _compact } from 'lodash'

import {
  Condition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ActionService } from '@/base/action-service'
import { VmInstanceState } from '@/common/enum'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { VmGroupQueryType } from './vm-group.model'

@Injectable()
export class VmGroupService extends ActionService {
  @Inject() zqlService: ZQLService

  async queryList(params: IQueryAction) {
    const { type = VmGroupQueryType.Normal, extraConditions = [] } = params
    const baseConditions = [
      {
        key: 'appliance',
        value: 'CUSTOMER',
        op: Op.eq
      }
    ]
    // const _zqlCondition = QueryConditionTranslator.translate(
    //   params.conditions.concat(baseConditions)
    // )
    let _extraZqlConditions
    let _resultResp = null

    const conditionsMap = conditionsToObject(extraConditions) as any

    switch (type) {
      case VmGroupQueryType.Normal:
        break
      case VmGroupQueryType.GetCandidateForCreateAutoScalingGroupVmTemplate:
        _extraZqlConditions = await this.getCandidateForCreateAutoScalingGroupVmTemplate()
        break
      default:
        break
    }

    const zqlCondition = this.buildZqlCondition(
      params.conditions.concat(baseConditions),
      _extraZqlConditions
    )

    _resultResp = await this.getVmGroupList(params, zqlCondition)

    return _resultResp
  }

  async getVmGroupList(param: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'VmSchedulingRuleGroup',
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
    const {
      results: [{ inventories: vmGroups, total }]
    } = await this.zqlService.call(zql)

    // 获取关联的云主机调度策略
    if (total > 0) {
      vmGroups?.map(vmGroup => {
        vmGroup.associatedVmSchedulingRuleList = []
        vmGroup.vmSchedulingRuleCount = 0
      })
      const vmGroupUuids = vmGroups?.map(vmGroup => vmGroup?.uuid)
      // 获取当前所有云主机调度组关联的所有云主机调度策略
      const zqlLocalObj: ZqlObject = {
        tableName: 'VmSchedulingRule',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VmSchedulingRuleRef',
                fields: ['vmSchedulingRuleUuid'],
                condition: {
                  vmGroupUuid: {
                    [ZOp.in]: vmGroupUuids
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
        // 查询ref表，获取云主机调度组和云主机调度策略的对应关系
        const relatedZqlObject = {
          tableName: 'VmSchedulingRuleRef',
          fields: ['vmSchedulingRuleUuid', 'vmGroupUuid', 'hostGroupUuid'],
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
          // 将云主机调度组与云主机调度策略 一对多 关联起来
          vmGroups?.map(vmGroup => {
            const vmSchedulingRuleUuids = relatedInventories
              ?.filter(relatedItem => vmGroup?.uuid === relatedItem?.vmGroupUuid)
              ?.map(it => it?.vmSchedulingRuleUuid)
            if (vmSchedulingRuleUuids?.length) {
              const vmSchedulingRules = vmSchedulingRuleInventories?.filter(vmSchedulingRule =>
                vmSchedulingRuleUuids.includes(vmSchedulingRule?.uuid)
              )
              vmGroup.associatedVmSchedulingRuleList = vmSchedulingRules
            }
          })
          // 将云主机调度策略与物理机调度组关联返回(因为云主机调度度需要返回调度策略类型，调度策略类型需要根据hostGroup判断)
          const hostGroupUuids = relatedInventories?.map(it => it?.hostGroupUuid)
          const hostGroupZqlObject = {
            tableName: 'HostSchedulingRuleGroup',
            condition: {
              uuid: {
                [ZOp.in]: hostGroupUuids
              }
            },
            returnWith: {
              total: true
            }
          }
          const {
            results: [{ inventories: hostGroupInventories, total: hostGroupTotal }]
          } = await this.zqlService.call(ZQL.stringify(hostGroupZqlObject))
          if (hostGroupTotal > 0) {
            const hostGroupRelatedVmScheudlingRuleMap = {}
            relatedInventories
              ?.filter(relatedItem => !!relatedItem?.hostGroupUuid)
              ?.forEach(it => {
                hostGroupRelatedVmScheudlingRuleMap[it.vmSchedulingRuleUuid] = it?.hostGroupUuid
              })

            vmGroups?.forEach(vmGroup => {
              vmGroup?.associatedVmSchedulingRuleList?.forEach(associatedRule => {
                const hostGroupUuid = hostGroupRelatedVmScheudlingRuleMap[associatedRule?.uuid]
                if (hostGroupUuid) {
                  associatedRule.hostGroup = hostGroupInventories?.find(
                    hostGroup => hostGroup?.uuid === hostGroupUuid
                  )
                }
              })
            })
          }
        }
      }
    }

    return {
      list: vmGroups,
      total: total
    }
  }

  async getCandidateForCreateAutoScalingGroupVmTemplate() {
    const zqlObject = {
      tableName: 'VmSchedulingRuleRef',
      fields: ['vmGroupUuid'],
      condition: {
        vmSchedulingRuleUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VmSchedulingRule',
              fields: ['uuid'],
              condition: {
                rule: 'ANTIAFFINITY',
                mode: 'HARD'
              }
            }
          }
        },
        hostGroupUuid: {
          [ZOp.is]: null
        }
      }
    }
    const {
      results: [{ inventories = [] }]
    } = await this.zqlService.call(ZQL.stringify(zqlObject))
    const vmGroupUuids = inventories?.map(it => it?.vmGroupUuid)
    return {
      uuid: {
        [ZOp.notIn]: vmGroupUuids
      }
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
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'VmGroupVO')
      )
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async getVmCount(vmGroup) {
    const zqlLocalObj: ZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'VMInstance',
      condition: {
        [ZOp.and]: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VmSchedulingRuleGroupRef',
                fields: ['vmUuid'],
                condition: {
                  vmGroupUuid: vmGroup?.uuid
                }
              }
            }
          },
          state: {
            [ZOp.ne]: VmInstanceState.Destroyed
          }
        }
      }
    }
    const {
      results: [{ total = 0 }]
    } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))

    return total
  }

  async getVmSchedulingRuleCount(vmGroup) {
    const zqlLocalObj: ZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'VmSchedulingRuleRef',
      fields: ['vmSchedulingRuleUuid'],
      condition: {
        vmGroupUuid: vmGroup?.uuid
      }
    }
    const {
      results: [{ total = 0 }]
    } = await this.zqlService.call(ZQL.stringify(zqlLocalObj))

    return total
  }

  // 获取关联的云主机调度策略
  async getAssociatedVmSchedulingRules(vmGroups) {
    vmGroups?.map(vmGroup => {
      vmGroup.associatedVmSchedulingRuleList = []
      vmGroup.vmSchedulingRuleCount = 0
    })
    const vmGroupUuids = vmGroups?.map(vmGroup => vmGroup?.uuid)
    // 获取当前所有云主机调度组关联的所有云主机调度策略
    const zqlLocalObj: ZqlObject = {
      tableName: 'VmSchedulingRule',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VmSchedulingRuleRef',
              fields: ['vmSchedulingRuleUuid'],
              condition: {
                vmGroupUuid: {
                  [ZOp.in]: vmGroupUuids
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
      // 查询ref表，获取云主机调度组和云主机调度策略的对应关系
      const relatedZqlObject = {
        tableName: 'VmSchedulingRuleRef',
        fields: ['vmSchedulingRuleUuid', 'vmGroupUuid'],
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
        // 将云主机调度组与云主机调度策略 一对多 关联起来
        vmGroups?.map(vmGroup => {
          const vmSchedulingRuleUuids = relatedInventories
            ?.filter(relatedItem => vmGroup?.uuid === relatedItem?.vmGroupUuid)
            ?.map(it => it?.vmSchedulingRuleUuid)
          if (vmSchedulingRuleUuids?.length) {
            const vmSchedulingRules = vmSchedulingRuleInventories?.filter(vmSchedulingRule =>
              vmSchedulingRuleUuids.includes(vmSchedulingRule?.uuid)
            )
            vmGroup.associatedVmSchedulingRuleList = vmSchedulingRules
          }
        })
      }
    }
    // 计算云主机调度组关联的云主机调度策略的数量
    vmGroups?.map(vmGroup => {
      vmGroup.vmSchedulingRuleCount = vmGroup?.associatedVmSchedulingRuleList?.length
    })
  }
}
