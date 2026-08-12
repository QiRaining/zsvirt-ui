import { Injectable, Inject } from '@nestjs/common'
import { cloneDeep as _cloneDeep } from 'lodash'

import { Op, extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeResourceOwnerAction } from '@/api/zstack/ChangeResourceOwnerAction'
import { GetAccountQuotaUsageAction } from '@/api/zstack/GetAccountQuotaUsageAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { ActionService } from '@/base/action-service'
import ZQL, { ZQLAction, ZOp } from '@/common/zql/index'
import { QueryConditionTranslator } from '@/common/zql/queryConditionTranslator'

import {
  OwnerQueryType,
  AccountOwner,
  ProjectOwner,
  AccountOwnerQueryResp,
  ProjectOwnerQueryResp,
  QueryOwnerArg,
  OwnerSummaryType,
  OwnerSummaryQueryResp,
  QueryOwnerSummaryArg
} from './owner.model'

type ZQLResp = {
  results: any[]
  success?: boolean
}

@Injectable()
export class OwnerService extends ActionService {
  @Inject() ZQLService: ZQLService
  @Inject() getAccountQuotaUsageAction: GetAccountQuotaUsageAction
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() revokeResourceAction: RevokeResourceSharingAction
  @Inject() changeResourceOwnerAction: ChangeResourceOwnerAction
  @Inject() getResourceAccountAction: GetResourceAccountAction

  __resourceUuid = ''
  __resourceUuids = []
  __currentZoneUuid = ''

  handleParams(params: QueryOwnerArg | QueryOwnerSummaryArg) {
    const clone = _cloneDeep(params)
    const { conditions = [] } = clone
    const extraConditionKeys = ['resourceUuid', 'currentZoneUuid', 'resourceUuids']
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(
      conditions,
      extraConditionKeys
    )
    clone.conditions = _conditions
    this.__resourceUuid = _extraConditionMap['resourceUuid']?.value
    this.__resourceUuids = _extraConditionMap['resourceUuids']?.values
    this.__currentZoneUuid = _extraConditionMap['currentZoneUuid']?.value
    return clone
  }

  async queryOwner(params: QueryOwnerArg): Promise<AccountOwnerQueryResp | ProjectOwnerQueryResp> {
    const { type } = params
    const clone = this.handleParams(params) as QueryOwnerArg
    switch (type) {
      case OwnerQueryType.Account:
        return this.queryAccount(clone)
      case OwnerQueryType.AccountGroup:
        return this.queryAccountGroup(clone)
      case OwnerQueryType.Project:
        return this.queryProject(clone)
      case OwnerQueryType.AccountCandidate:
        return this.queryCandidatesAccount(clone)
      case OwnerQueryType.ProjectCandidate:
        if (!this.__currentZoneUuid) {
          throw new Error('param currentZoneUuid is required')
        }
        return this.queryCandidatesProject(clone)
      case OwnerQueryType.AllAccount:
        return this.queryAllAccount(clone)
      case OwnerQueryType.AllProject:
        if (!this.__currentZoneUuid) {
          throw new Error('param currentZoneUuid is required')
        }
        return this.queryAllProject(clone)
      case OwnerQueryType.AllAccountGroup:
        return this.queryAllAccountGroup(clone)
      case OwnerQueryType.AccountOwner:
        return this.queryAccountForChangeOwner(clone)
      case OwnerQueryType.ProjectOwner:
        if (!this.__currentZoneUuid) {
          throw new Error('param currentZoneUuid is required')
        }
        return this.queryProjectForChangeOwner(clone)
    }
  }

  async querySummary(params: QueryOwnerSummaryArg): Promise<OwnerSummaryQueryResp> {
    const { type } = params
    const clone = this.handleParams(params) as QueryOwnerArg
    let account: AccountOwnerQueryResp
    let project: ProjectOwnerQueryResp
    if (type === OwnerSummaryType.Normal) {
      ;[account, project] = await Promise.all([this.queryAccount(clone), this.queryProject(clone)])
    }
    if (type === OwnerSummaryType.Candidate) {
      ;[account, project] = await Promise.all([
        this.queryCandidatesAccount(clone),
        this.queryCandidatesProject(clone)
      ])
    }
    if (type === OwnerSummaryType.ChangeOwner) {
      ;[account, project] = await Promise.all([
        this.queryAccountForChangeOwner(clone),
        this.queryProjectForChangeOwner(clone)
      ])
    }
    if (type === OwnerSummaryType.All) {
      ;[account, project] = await Promise.all([
        this.queryAllAccount(clone),
        this.queryAllProject(clone)
      ])
    }
    return {
      account: account?.total || 0,
      project: project?.total || 0
    }
  }

  async queryProjectAdmin(projectUuid: string) {
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'iam2VirtualIDAttribute',
            fields: ['virtualIDUuid'],
            condition: {
              name: {
                [ZOp.in]: ['__ProjectAdmin__', '__IAM2ProjectAdmin__']
              },
              value: {
                [ZOp.in]: [projectUuid]
              }
            }
          }
        }
      }
    }
    const queryZql = ZQL.stringify({
      tableName: 'iam2VirtualID',
      condition: zqlCondition
    })
    const zqlResp = await this.ZQLService.call(queryZql)
    if (zqlResp.results.length > 0) {
      const { inventories } = zqlResp.results[0]
      return inventories[0]?.name ?? null
    } else {
      return null
    }
  }

  private async queryAccount(params: QueryOwnerArg): Promise<AccountOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions } = params
    conditions.push({ key: 'name', op: Op.ne, value: 'admin' })
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'AccountResourceRef',
            fields: ['accountUuid'],
            condition: {
              resourceUuid: this.__resourceUuid,
              accountUuid: {
                [ZOp.not]: null
              },
              accountPermissionFrom: {
                [ZOp.is]: null
              }
            }
          }
        }
      },
      ...QueryConditionTranslator.translate(conditions)
    }
    const queryZql = ZQL.multStringify([
      {
        tableName: 'account',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'account',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)
    return await this.handleAccountZqlResult(zqlResp)
  }

  private async queryAccountGroup(params: QueryOwnerArg): Promise<AccountOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions } = params
    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'AccountGroupResourceRef',
            fields: ['groupUuid'],
            condition: {
              resourceUuid: this.__resourceUuid
            }
          }
        }
      },
      ...QueryConditionTranslator.translate(conditions)
    }
    const queryZql = ZQL.multStringify([
      {
        tableName: 'accountGroup',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'accountGroup',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)

    return {
      list: zqlResp.results[0].inventories ?? [],
      total: zqlResp.results[0].total ?? 0,
      type: OwnerQueryType.AccountGroup
    }
  }

  private async queryProject(params: QueryOwnerArg): Promise<ProjectOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions } = params
    conditions.push({ key: 'name', op: Op.ne, value: 'admin' })
    const zqlCondition = {
      linkedAccountUuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'SharedResource',
            fields: ['receiverAccountUuid'],
            condition: {
              resourceUuid: this.__resourceUuid,
              receiverAccountUuid: {
                [ZOp.not]: null
              }
            }
          }
        }
      },
      ...QueryConditionTranslator.translate(conditions)
    }
    const queryZql = ZQL.multStringify([
      {
        tableName: 'iam2Project',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'iam2Project',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)
    return this.handleProjectZqlResult(zqlResp)
  }

  private async queryAccountForChangeOwner(params: QueryOwnerArg): Promise<AccountOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions } = params
    const { inventories } = await this.getResourceAccountAction.call({
      resourceUuids: this.__resourceUuids
    })
    const accountUuidList = []
    Object.keys(inventories).forEach(resourceUuid => {
      if (!accountUuidList.includes(inventories[resourceUuid].uuid)) {
        accountUuidList.push(inventories[resourceUuid].uuid)
      }
    })
    let zqlCondition: any = {
      ...QueryConditionTranslator.translate(conditions)
    }
    if (accountUuidList.length === 1) {
      zqlCondition = {
        uuid: {
          [ZOp.ne]: accountUuidList[0]
        },
        ...QueryConditionTranslator.translate(conditions)
      }
    }

    const queryZql = ZQL.multStringify([
      {
        tableName: 'account',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'account',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)
    return await this.handleAccountZqlResult(zqlResp)
  }

  private async queryProjectForChangeOwner(params: QueryOwnerArg): Promise<ProjectOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions } = params
    const { inventories } = await this.getResourceAccountAction.call({
      resourceUuids: this.__resourceUuids
    })
    const accountUuidList = []
    Object.keys(inventories).forEach(resourceUuid => {
      if (!accountUuidList.includes(inventories[resourceUuid].uuid)) {
        accountUuidList.push(inventories[resourceUuid].uuid)
      }
    })
    let zqlCondition: any = {
      state: {
        [ZOp.notIn]: ['Deleted', 'Retired', 'Disabled']
      },
      [ZOp.or]: [
        {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'iAM2ProjectAttribute',
                fields: ['projectUuid'],
                condition: {
                  value: this.__currentZoneUuid,
                  name: '__ProjectRelatedZone__'
                }
              }
            }
          }
        },
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'iAM2ProjectAttribute',
                fields: ['projectUuid'],
                condition: {
                  name: '__ProjectRelatedZone__'
                }
              }
            }
          }
        }
      ],
      ...QueryConditionTranslator.translate(conditions)
    }
    if (accountUuidList.length === 1) {
      zqlCondition = {
        state: {
          [ZOp.notIn]: ['Deleted', 'Retired', 'Disabled']
        },
        linkedAccountUuid: {
          [ZOp.ne]: accountUuidList[0]
        },
        [ZOp.or]: [
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'iAM2ProjectAttribute',
                  fields: ['projectUuid'],
                  condition: {
                    value: this.__currentZoneUuid,
                    name: '__ProjectRelatedZone__'
                  }
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'iAM2ProjectAttribute',
                  fields: ['projectUuid'],
                  condition: {
                    name: '__ProjectRelatedZone__'
                  }
                }
              }
            }
          }
        ],
        ...QueryConditionTranslator.translate(conditions)
      }
    }
    const queryZql = ZQL.multStringify([
      {
        tableName: 'iam2Project',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'iam2Project',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)
    return this.handleProjectZqlResult(zqlResp)
  }

  private async handleAccountZqlResult(zqlResp: ZQLResp) {
    if (zqlResp.results.length > 0) {
      const { inventories }: { inventories: AccountOwner[] } = zqlResp.results[0]
      const { total } = zqlResp.results[1]
      const tasks = inventories.map(async inventory => {
        // const resp = await this.getAccountQuotaUsageAction.call({
        //   uuid: inventory.uuid
        // })
        // inventory.volumeNum = resp.usages.find(
        //   i => i.name === 'volume.data.num'
        // ).used
        // inventory.vmNum = resp.usages.find(i => i.name === 'vm.num').used
        const zql = [
          {
            action: ZQLAction.COUNT,
            tableName: 'vminstance',
            condition: {
              type: 'UserVm',
              hypervisorType: {
                [ZOp.ne]: 'ESX'
              },
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'accountResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VmInstanceVO',
                      accountUuid: {
                        [ZOp.eq]: inventory.uuid
                      }
                    }
                  }
                }
              }
            }
          },
          {
            action: ZQLAction.COUNT,
            tableName: 'Volume',
            condition: {
              type: 'Data',
              format: {
                [ZOp.ne]: 'vmtx'
              },
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'accountResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VolumeVO',
                      accountUuid: {
                        [ZOp.eq]: inventory.uuid
                      }
                    }
                  }
                }
              }
            }
          }
        ]
        const { results } = await this.ZQLService.call(ZQL.multStringify(zql))
        inventory.vmNum = results?.[0]?.total ?? 0
        inventory.volumeNum = results?.[1]?.total || 0
      })
      await Promise.all(tasks)
      return {
        list: inventories.length > 0 ? inventories : [],
        total,
        type: OwnerQueryType.Account
      }
    } else {
      return {
        list: [],
        total: 0,
        type: OwnerQueryType.Account
      }
    }
  }

  private async handleProjectZqlResult(zqlResp: ZQLResp) {
    if (zqlResp.results.length > 0) {
      const { inventories }: { inventories: ProjectOwner[] } = zqlResp.results[0]
      const { total } = zqlResp.results[1]
      const tasks = inventories.map(async inventory => {
        // const resp = await this.getAccountQuotaUsageAction.call({
        //   uuid: inventory.linkedAccountUuid
        // })
        // inventory.volumeNum = resp.usages.find(
        //   i => i.name === 'volume.data.num'
        // ).used
        // inventory.vmNum = resp.usages.find(i => i.name === 'vm.num').used
        const zql = [
          {
            action: ZQLAction.COUNT,
            tableName: 'vminstance',
            condition: {
              type: 'UserVm',
              hypervisorType: {
                [ZOp.ne]: 'ESX'
              },
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'accountResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VmInstanceVO',
                      accountUuid: {
                        [ZOp.eq]: inventory.linkedAccountUuid
                      }
                    }
                  }
                }
              }
            }
          },
          {
            action: ZQLAction.COUNT,
            tableName: 'Volume',
            condition: {
              type: 'Data',
              format: {
                [ZOp.ne]: 'vmtx'
              },
              uuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'accountResourceRef',
                    fields: ['resourceUuid'],
                    condition: {
                      resourceType: 'VolumeVO',
                      accountUuid: {
                        [ZOp.eq]: inventory.linkedAccountUuid
                      }
                    }
                  }
                }
              }
            }
          }
        ]
        const { results } = await this.ZQLService.call(ZQL.multStringify(zql))
        inventory.vmNum = results?.[0]?.total ?? 0
        inventory.volumeNum = results?.[1]?.total || 0
      })
      await Promise.all(tasks)
      return {
        list: inventories.length > 0 ? inventories : [],
        total,
        type: OwnerQueryType.Project
      }
    } else {
      return {
        list: [],
        total: 0,
        type: OwnerQueryType.Project
      }
    }
  }

  private async queryCandidatesAccount(params: QueryOwnerArg): Promise<AccountOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions } = params
    conditions.push({ key: 'name', op: Op.ne, value: 'admin' })
    const zqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'SharedResource',
            fields: ['receiverAccountUuid'],
            condition: {
              resourceUuid: this.__resourceUuid,
              receiverAccountUuid: {
                [ZOp.not]: null
              }
            }
          }
        }
      },
      ...QueryConditionTranslator.translate(conditions)
    }
    const queryZql = ZQL.multStringify([
      {
        tableName: 'account',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'account',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)
    return await this.handleAccountZqlResult(zqlResp)
  }

  private async queryCandidatesProject(params: QueryOwnerArg): Promise<ProjectOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions } = params
    conditions.push({ key: 'name', op: Op.ne, value: 'admin' })
    const zqlCondition = {
      linkedAccountUuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'SharedResource',
            fields: ['receiverAccountUuid'],
            condition: {
              resourceUuid: this.__resourceUuid,
              receiverAccountUuid: {
                [ZOp.not]: null
              }
            }
          }
        }
      },
      [ZOp.or]: [
        {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'iAM2ProjectAttribute',
                fields: ['projectUuid'],
                condition: {
                  value: this.__currentZoneUuid,
                  name: '__ProjectRelatedZone__'
                }
              }
            }
          }
        },
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'iAM2ProjectAttribute',
                fields: ['projectUuid'],
                condition: {
                  name: '__ProjectRelatedZone__'
                }
              }
            }
          }
        }
      ],
      ...QueryConditionTranslator.translate(conditions)
    }
    const queryZql = ZQL.multStringify([
      {
        tableName: 'iam2Project',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'iam2Project',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)
    return this.handleProjectZqlResult(zqlResp)
  }

  private async queryAllAccount(params: QueryOwnerArg): Promise<AccountOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions, extraConditions = [] } = params
    const [_conditions, extraConditionMap] = extractAndRemoveExtraCondition(extraConditions, [
      'withAdmin'
    ])
    if (extraConditionMap?.withAdmin?.value !== 'true') {
      conditions.push({ key: 'name', op: Op.ne, value: 'admin' })
    }
    const zqlCondition = {
      ...QueryConditionTranslator.translate(conditions)
    }
    const queryZql = ZQL.multStringify([
      {
        tableName: 'account',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'account',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)
    return await this.handleAccountZqlResult(zqlResp)
  }

  private async queryAllAccountGroup(params: QueryOwnerArg): Promise<AccountOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions, extraConditions = [] } = params
    const [_conditions, extraConditionMap] = extractAndRemoveExtraCondition(extraConditions, [
      'withAdmin'
    ])
    if (extraConditionMap?.withAdmin?.value !== 'true') {
      conditions.push({ key: 'name', op: Op.ne, value: 'admin' })
    }
    const zqlCondition = {
      ...QueryConditionTranslator.translate(conditions)
    }
    const queryZql = ZQL.multStringify([
      {
        tableName: 'account',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'account',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)
    return await this.handleAccountZqlResult(zqlResp)
  }

  private async queryAllProject(params: QueryOwnerArg): Promise<ProjectOwnerQueryResp> {
    const { limit, start, sortDirection, sortBy, conditions } = params
    conditions.push({ key: 'name', op: Op.ne, value: 'admin' })
    const zqlCondition = {
      [ZOp.or]: [
        {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'iAM2ProjectAttribute',
                fields: ['projectUuid'],
                condition: {
                  value: this.__currentZoneUuid,
                  name: '__ProjectRelatedZone__'
                }
              }
            }
          }
        },
        {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'iAM2ProjectAttribute',
                fields: ['projectUuid'],
                condition: {
                  name: '__ProjectRelatedZone__'
                }
              }
            }
          }
        }
      ],
      ...QueryConditionTranslator.translate(conditions)
    }
    const queryZql = ZQL.multStringify([
      {
        tableName: 'iam2Project',
        condition: zqlCondition,
        offset: start,
        orderBy: sortBy,
        orderDirection: sortDirection,
        limit: limit
      },
      {
        tableName: 'iam2Project',
        condition: zqlCondition,
        action: ZQLAction.COUNT
      }
    ])
    const zqlResp = await this.ZQLService.call(queryZql)
    return this.handleProjectZqlResult(zqlResp)
  }

  getProjectLinkedAccount = async (uuids: string[]): Promise<string[]> => {
    const queryZql = ZQL.stringify({
      tableName: 'iam2Project',
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    })
    const zqlResp = await this.ZQLService.call(queryZql)
    if (zqlResp.results.length > 0) {
      const { inventories }: { inventories: ProjectOwner[] } = zqlResp.results[0]
      return inventories.map(cv => cv.linkedAccountUuid)
    } else {
      return []
    }
  }
}
