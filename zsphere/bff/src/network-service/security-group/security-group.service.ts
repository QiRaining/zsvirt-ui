import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { conditionsToObject, extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  QueryAction as IQueryAction,
  Condition as ICondition
} from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'

import { QuerySecurityGroupArgs, SecurityGroupQueryType } from './security-group.model'

@Injectable()
export class SecurityGroupService {
  @Inject() zqlService: ZQLService

  private projectUuidDataLoader
  private vmNicCountDataLoader

  constructor() {
    this.projectUuidDataLoader = new DataLoader(this._projectUuid)
    this.vmNicCountDataLoader = new DataLoader(this._vmNicCount)
  }

  async query(params: QuerySecurityGroupArgs) {
    const { type = 'NORMAL' } = params
    let _resultResp = null
    let finalConditions: ICondition[] = []
    switch (type) {
      case 'NORMAL':
        finalConditions = []
        break
    }

    _resultResp = await this.getSecurityGroupList({
      ...params,
      conditions: (params.conditions || []).concat(finalConditions)
    })

    return _resultResp
  }

  private async getZqlCondition(params: QuerySecurityGroupArgs) {
    const { conditions = [], type = SecurityGroupQueryType.Normal } = params
    let zqlCondition = await this.buildZqlCondition(conditions)

    if (type === SecurityGroupQueryType.ALL) {
      const conditionsWithoutZone = _.dropWhile(zqlCondition.and, 'l3Network.zoneUuid')

      const conditionsForUuid = {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'SecurityGroup.uuid',
              condition: {
                'l3Network.uuid': {
                  [ZOp.not]: null
                }
              }
            }
          }
        }
      }

      zqlCondition = {
        [ZOp.or]: [
          conditionsWithoutZone.length > 0
            ? {
                [ZOp.and]: {
                  [ZOp.and]: conditionsWithoutZone,
                  ...conditionsForUuid
                }
              }
            : conditionsForUuid,
          {
            [ZOp.and]: [zqlCondition]
          }
        ]
      }
    }

    if (type === SecurityGroupQueryType.GetIAM2ProjectCandidateDefaultSecurityGroup) {
      zqlCondition = this.getIAM2ProjectCandidateDefaultSecurityGroup(params)
    }

    if (type === SecurityGroupQueryType.Account) {
      zqlCondition = this.querySecurityGroupByAccount(params)
    }

    if (type === SecurityGroupQueryType.GetVmNicCandidateSecurityGroup) {
      zqlCondition = this.getVmNicCandidateSecurityGroup(params)
    }

    return zqlCondition
  }

  async getSecurityGroupList(params: QuerySecurityGroupArgs) {
    const zqlCondition = await this.getZqlCondition(params)

    if (zqlCondition) {
      const zqlObject = {
        tableName: 'SecurityGroup',
        condition: zqlCondition,
        orderBy: params.sortBy,
        orderDirection: params.sortDirection,
        limit: params.limit,
        offset: params.start,
        returnWith: {
          total: true
        }
      }

      const zql = ZQL.stringify(zqlObject)
      const { results } = await this.zqlService.call(zql)
      const list = results?.[0]?.inventories ?? []
      const total = results?.[0]?.total ?? 0

      return {
        list,
        total
      }
    }

    return {
      list: [],
      total: 0
    }
  }

  async queryRule(params: IQueryAction) {
    const { type = 'NORMAL' } = params
    let _resultResp = null
    let finalConditions: ICondition[] = []
    switch (type) {
      case 'NORMAL':
        finalConditions = []
        break
    }

    _resultResp = await this.getSecurityGroupRuleList({
      ...params,
      conditions: params.conditions.concat(finalConditions)
    })

    return _resultResp
  }

  async getSecurityGroupRuleList(param: IQueryAction) {
    const zqlCondition = await this.buildZqlCondition(param.conditions)

    const zqlObject = {
      tableName: 'SecurityGroupRule',
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
    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list,
      total
    }
  }

  private async buildZqlCondition(conditions: ICondition[]) {
    let zqlCondition = QueryConditionTranslator.translate(conditions)
    const specicalCondition = []
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, ['ownerName'])

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'SecurityGroupVO')
      )
    }

    zqlCondition =
      specicalCondition.length > 0
        ? _.assign(zqlCondition, { [ZOp.and]: specicalCondition })
        : zqlCondition
    return zqlCondition
  }

  private getIAM2ProjectCandidateDefaultSecurityGroup(params: QuerySecurityGroupArgs) {
    const { extraConditions } = params
    const conditionMap = conditionsToObject(extraConditions)

    const extraCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'IAM2ProjectResourceRef',
            fields: ['resourceUuid'],
            condition: {
              projectUuid: {
                [ZOp.eq]: conditionMap['projectUuid']
              },
              resourceType: {
                [ZOp.eq]: 'SecurityGroupVO'
              }
            }
          }
        }
      }
    }

    return extraCondition
  }

  private querySecurityGroupByAccount(params: QuerySecurityGroupArgs) {
    const { conditions } = params
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(_.cloneDeep(conditions), [
      'accountUuid'
    ])

    if (_extraConditionMap['accountUuid']) {
      const accountUuid = _extraConditionMap['accountUuid'].value

      const zqlObject = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'AccountResourceRef',
              fields: ['resourceUuid'],
              condition: {
                accountUuid: {
                  [ZOp.eq]: accountUuid
                },
                resourceType: 'SecurityGroupVO'
              }
            }
          }
        }
        // ...QueryConditionTranslator.translate(_conditions)['and']
      }

      return zqlObject
    }

    return null
  }

  private getVmNicCandidateSecurityGroup(params: QuerySecurityGroupArgs) {
    const { conditions, extraConditions } = params
    const translateZql = QueryConditionTranslator.translate(conditions)
    const conditionMap = conditionsToObject(extraConditions)

    const zqlObject = {
      [ZOp.and]: [
        ...translateZql['and'],
        {
          [ZOp.or]: [
            {
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'SecurityGroupL3NetworkRef',
                    fields: ['securityGroupUuid'],
                    condition: {
                      l3NetworkUuid: conditionMap['l3NetworkUuid']
                    }
                  }
                }
              }
            }
          ]
        }
      ]
    }

    return zqlObject
  }

  private _projectUuid = async (securityGroupUuids: string[]) => {
    const zqlObject = ZQL.stringify({
      tableName: 'IAM2ProjectResourceRef',
      fields: ['projectUuid', 'resourceUuid'],
      condition: {
        resourceUuid: {
          [ZOp.in]: securityGroupUuids
        },
        resourceType: 'SecurityGroupVO'
      }
    })

    const { results } = await this.zqlService.call(zqlObject)
    const inventories = _.get(results, ['0', 'inventories'], [])

    const securityGroupMap = _.reduce(
      inventories,
      (obj, curr) => {
        if (!obj[curr.resourceUuid]) {
          obj[curr.resourceUuid] = curr?.projectUuid
        }
        return obj
      },
      {}
    )

    return securityGroupUuids.map(uuid => _.get(securityGroupMap, uuid, null))
  }

  projectUuid(securityGroupUuid: string) {
    return this.projectUuidDataLoader.load(securityGroupUuid)
  }

  private _vmNicCount = async (securityGroupUuids: string[]) => {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'VmNicSecurityGroupRef',
      groupBy: 'securityGroupUuid',
      condition: {
        securityGroupUuid: {
          [ZOp.in]: securityGroupUuids
        }
      }
    })

    const { results = [] } = await this.zqlService.call(zql)

    const vmNicSecurityGroupRefMap = _.reduce(
      _.get(results, ['0', 'inventoryCounts'], []),
      (obj, item) => {
        const [it, total] = item
        obj[it?.securityGroupUuid] = total

        return obj
      },
      {}
    )

    return securityGroupUuids.map(securityGroupUuid =>
      _.get(vmNicSecurityGroupRefMap, securityGroupUuid, 0)
    )
  }

  vmNicCount(securityGroupUuid: string) {
    return this.vmNicCountDataLoader.load(securityGroupUuid)
  }
}
