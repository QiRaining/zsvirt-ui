import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import DataLoader from 'dataloader'
import { get as _get, compact as _compact } from 'lodash'

import {
  Condition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetVmSchedulingRulesExecuteStateAction } from '@/api/zstack/GetVmSchedulingRulesExecuteStateAction'
import { ValidateVmSchedulingRuleAction } from '@/api/zstack/ValidateVmSchedulingRuleAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { ZsProfile } from '@/model/zs-profile.model'

import {
  ValidateVmSchedulingRuleParam,
  VmSchedulingRuleQueryType
} from './vm-scheduling-rule.model'

@Injectable()
export class VmSchedulingRuleService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject()
  getVmSchedulingRulesExecuteStateAction: GetVmSchedulingRulesExecuteStateAction
  @Inject() validateVmSchedulingRuleAction: ValidateVmSchedulingRuleAction
  @InjectModel(ZsProfile) private zsProfile: typeof ZsProfile

  async queryList(params: IQueryAction) {
    const { type = VmSchedulingRuleQueryType.Normal, extraConditions = [] } = params
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
      case VmSchedulingRuleQueryType.Normal:
        break

      case VmSchedulingRuleQueryType.AssociateVmGroup:
        _extraZqlConditions = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VmSchedulingRuleRef',
                fields: ['vmSchedulingRuleUuid'],
                condition: {
                  vmGroupUuid: conditionsMap?.vmGroupUuid
                }
              }
            }
          }
        }
        break

      case VmSchedulingRuleQueryType.AssociateHostGroup:
        _extraZqlConditions = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VmSchedulingRuleRef',
                fields: ['vmSchedulingRuleUuid'],
                condition: {
                  hostGroupUuid: conditionsMap?.hostGroupUuid
                }
              }
            }
          }
        }
        break

      default:
        break
    }

    const zqlCondition = this.buildZqlCondition(
      params.conditions.concat(baseConditions),
      _extraZqlConditions
    )

    _resultResp = await this.getVmSchedulingRuleList(params, zqlCondition)

    return _resultResp
  }

  async getVmSchedulingRuleList(param: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'VmSchedulingRule',
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
    const vmSchedulingRuleList = results?.[0]?.inventories || []
    const total = results?.[0]?.total || 0
    if (total > 0) {
      // 获取当前查询的云主机调度策略对应的云主机调度组和物理机调度组
      const vmSchedulingRuleUuids = vmSchedulingRuleList?.map(rule => rule?.uuid)
      // 查询ref表获取当前所有云主机调度策略对应的vmGroupUuid和hostGroupUuid
      const relatedZqlObject = {
        tableName: 'VmSchedulingRuleRef',
        fields: ['vmSchedulingRuleUuid', 'vmGroupUuid', 'hostGroupUuid'],
        condition: {
          vmSchedulingRuleUuid: {
            [ZOp.in]: vmSchedulingRuleUuids
          }
        }
      }
      const { results: relatedZqlResult } = await this.zqlService.call(
        ZQL.stringify(relatedZqlObject)
      )
      const vmGroupsAndHostGroups = relatedZqlResult?.[0]?.inventories
      // 查询对应所有云主机调度组
      const vmGroupUuids = vmGroupsAndHostGroups?.map(it => it?.vmGroupUuid)
      const vmGroupsZqlObject = {
        tableName: 'VmSchedulingRuleGroup',
        condition: {
          uuid: {
            [ZOp.in]: vmGroupUuids
          }
        }
      }
      const { results: vmGroupsResult } = await this.zqlService.call(
        ZQL.stringify(vmGroupsZqlObject)
      )
      const vmGroupList = vmGroupsResult?.[0]?.inventories
      // 查询对应所有物理机调度组
      const hostGroupUuids = vmGroupsAndHostGroups?.map(it => it?.hostGroupUuid)
      const hostGroupsZqlObject = {
        tableName: 'HostSchedulingRuleGroup',
        condition: {
          uuid: {
            [ZOp.in]: hostGroupUuids
          }
        }
      }
      const { results: hostGroupsResult } = await this.zqlService.call(
        ZQL.stringify(hostGroupsZqlObject)
      )
      const hostGroupList = hostGroupsResult?.[0]?.inventories
      // 云主机调度策略与云主机调度组/物理机调度组一一对应
      vmSchedulingRuleList?.map(rule => {
        const { vmGroupUuid, hostGroupUuid } =
          vmGroupsAndHostGroups?.find(it => it?.vmSchedulingRuleUuid === rule?.uuid) || {}
        rule.vmGroup = vmGroupList?.find(vmGroup => vmGroup?.uuid === vmGroupUuid)
        rule.hostGroup = hostGroupList?.find(hostGroup => hostGroup?.uuid === hostGroupUuid)
      })

      // 批量查询云主机调度策略的执行状态
      const excuteStateResult = await this.getVmSchedulingRulesExecuteStateAction.call({
        uuids: vmSchedulingRuleUuids
      })
      const excuteStateMap = excuteStateResult?.ruleMapState
      vmSchedulingRuleList?.map(rule => {
        rule.excuteState = excuteStateMap?.[rule?.uuid]
      })
    }

    return {
      list: vmSchedulingRuleList,
      total: total
    }
  }

  buildZqlCondition(conditions: Condition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName',
      'type',
      'excuteState'
    ])

    const specicalCondition = []

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'VmSchedulingRuleVO')
      )
    }

    // 过滤云主机调度策略的类型
    if (_extraConditionMap['type']) {
      const typeList = _extraConditionMap['type']?.values
      if (typeList?.length > 0 && typeList?.length < 4) {
        const renderCondition = type => {
          return {
            [ZOp.and]: {
              rule: ['AffinityVm', 'VmAffinityHost'].includes(type) ? 'AFFINITY' : 'ANTIAFFINITY',
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'VmSchedulingRuleRef',
                    fields: ['vmSchedulingRuleUuid'],
                    condition: {
                      hostGroupUuid: {
                        [['AffinityVm', 'AntiAffinityVm'].includes(type) ? ZOp.is : ZOp.not]: null
                      }
                    }
                  }
                }
              }
            }
          }
        }
        specicalCondition.push({
          [ZOp.or]: typeList?.map(it => renderCondition(it))
        })
      }
    }

    // 过滤调度状态
    if (_extraConditionMap['excuteState']) {
      const executeStates = _extraConditionMap['excuteState']?.values
      specicalCondition.push({
        uuid: {
          [ZOp.in]: {
            [ZOp.getapi]: {
              action: ZQLAction.GET_API,
              api: 'ListVmSchedulingRulesFromExecuteState',
              output: 'uuids',
              condition: {
                executeStates: {
                  [ZOp.in]: executeStates
                }
              }
            }
          }
        }
      })
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async getUpgradeConfig() {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const res = await this.zsProfile.findOne({
      where: {
        userId: session.userId,
        identity: session.identity,
        type: 'ResourceUpgradeConfig'
      }
    })

    return {
      userId: session.userId,
      upgradeConfig: res?.content || ''
    }
  }

  async validateVmSchedulingRule(input: ValidateVmSchedulingRuleParam) {
    return await this.validateVmSchedulingRuleAction.call(input)
  }
}
