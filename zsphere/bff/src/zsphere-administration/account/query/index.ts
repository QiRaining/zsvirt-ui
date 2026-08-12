import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import { ApolloError } from 'apollo-server-errors'
import DataLoader from 'dataloader'
import {
  compact as _compact,
  get as _get,
  reduce as _reduce,
  cloneDeep as _cloneDeep
} from 'lodash'

import { conditionsToObject, extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetAccountPriceTableRefAction } from '@/api/zstack/GetAccountPriceTableRefAction'
import { GetAccountQuotaUsageAction } from '@/api/zstack/GetAccountQuotaUsageAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import Constant from '@/common/const'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { ZsSession } from '@/model/zs-session.model'
import { PrivilegeService } from '@/privilege/privilege.service'

import { AccountQueryType } from '../account.model'

@Injectable()
export class AccountQueryService {
  @Inject(CONTEXT) private readonly context
  @Inject()
  zqlService: ZQLService
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject()
  getAccountQuotaUsageAction: GetAccountQuotaUsageAction
  @Inject()
  getAccountPriceTableRefAction: GetAccountPriceTableRefAction
  @Inject()
  privilegeService: PrivilegeService
  @Inject()
  getResourceAccountAction: GetResourceAccountAction

  private accountQuotaInfoDataLoader
  private vmNumDataLoader
  private volumeNumDataLoader

  private roleDataloader
  private roleFromAccountGroupDataloader

  constructor() {
    this.accountQuotaInfoDataLoader = new DataLoader(this._getAccountQuotaInfo)
    this.vmNumDataLoader = new DataLoader(this._getVmNum)
    this.volumeNumDataLoader = new DataLoader(this._getVolumeNum)

    this.roleDataloader = new DataLoader(this._getRole)
    this.roleFromAccountGroupDataloader = new DataLoader(this._getRoleFromAccountGroup)
  }

  protected getSessionId(): string {
    return this.context.req.headers['x-session-id']
  }

  protected getZsSession() {
    return this.zsSession
  }

  async query(params) {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }

    const hasPrivilege = await this.privilegeService.hasPrivilege()
    if (!hasPrivilege) {
      throw new ApolloError('无UI权限', 'FORBIDDEN', { statusCode: 403 })
    }

    const { type: accountType = AccountQueryType.Normal, conditions } = params
    let _extrazqlConditions
    switch (accountType) {
      case AccountQueryType.Normal:
        break

      case AccountQueryType.BillingPriceTable:
        _extrazqlConditions = this.getAccountForBillingPriceTable(params)
        break

      case AccountQueryType.BillingPriceTableBindCandidate:
        _extrazqlConditions = this.getAccountForBillingPriceTable(params, true)
        break

      case AccountQueryType.GET_ACCOUNT_BY_USERGROUP:
        _extrazqlConditions = this.getAccountByUserGroup({ params })
        break
      case AccountQueryType.GET_ACCOUNT_BY_NOT_USERGROUP:
        _extrazqlConditions = this.getAccountByUserGroup({
          params,
          isIn: false
        })
        break

      case AccountQueryType.GET_ACCOUNT_BY_ROLE:
        _extrazqlConditions = this.getAccountByRole(params)
        break

      case AccountQueryType.GET_ACCOUNT_BY_SHARED:
        _extrazqlConditions = this.getAccountByShared({ params })
        break

      case AccountQueryType.GET_ACCOUNT_BY_NOT_SHARED:
        _extrazqlConditions = this.getAccountByShared({
          params,
          isShare: false
        })
        break
    }

    const [, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'subAccountSource',
      'resourceUuids'
    ])

    const specicalCondition = []

    if (_extraConditionMap['subAccountSource']) {
      const types = _extraConditionMap['subAccountSource'].values
      if (types?.length) {
        specicalCondition.push({
          type: {
            [ZOp.in]: types
          }
        })
      }
    }

    if (_extraConditionMap['resourceUuids']) {
      const { inventories } = await this.getResourceAccountAction.call({
        resourceUuids: _extraConditionMap['resourceUuids']?.values
      })

      const accountUuidList = []
      Object.keys(inventories).forEach(resourceUuid => {
        if (!accountUuidList.includes(inventories[resourceUuid].uuid)) {
          accountUuidList.push(inventories[resourceUuid].uuid)
        }
      })

      if (accountUuidList.length === 1) {
        specicalCondition.push({
          uuid: {
            [ZOp.ne]: accountUuidList[0]
          },
          ...QueryConditionTranslator.translate(conditions)
        })
      }
    }

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specicalCondition.concat(_extrazqlConditions))
    )

    return await this.getIAM2VirtualID(params, zqlCondition)
  }

  getAccountByUserGroup({ params, isIn = true }) {
    const conditionsMap = conditionsToObject(params?.extraConditions)
    const userGroupUuid = conditionsMap?.['userGroupUuid']

    const userGroupUuids = conditionsMap?.['userGroupUuids'] || []
    const groupUuidList = _compact([userGroupUuid, ...userGroupUuids])

    return {
      uuid: {
        [isIn ? ZOp.in : ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'AccountGroupAccountRef',
            fields: ['accountUuid'],
            condition: {
              groupUuid: {
                [ZOp.in]: groupUuidList
              }
            }
          }
        }
      }
    }
  }

  getAccountByRole(params) {
    const conditionsMap = conditionsToObject(params?.extraConditions)
    const roleUuid = conditionsMap?.['roleUuid']
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'RoleAccountRef',
            fields: ['accountUuid'],
            condition: {
              roleUuid
            }
          }
        }
      }
    }
  }

  getAccountByShared({ params, isShare = true }) {
    const conditionsMap = conditionsToObject(params?.extraConditions)
    const resourceUuid = conditionsMap?.['resourceUuid']
    return {
      uuid: {
        [isShare ? ZOp.in : ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'AccountResourceRef',
            fields: ['accountUuid'],
            condition: {
              resourceUuid,
              accountPermissionFrom: {
                [ZOp.is]: null
              }
            }
          }
        }
      }
    }
  }

  async getIAM2VirtualID(param, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'Account',
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
    console.log(zql, '-->>>')
    const { results } = await this.zqlService.call(zql)
    const data = results?.[0] ?? {}
    const { inventories: list = [], total = 0 } = data
    return { list, total }
  }

  getAccountForBillingPriceTable(params, bindList?: boolean) {
    const { extraConditions = [] } = params
    const extraConditionsMap = conditionsToObject(extraConditions)
    const billingPriceTableUuid = extraConditionsMap['billingPriceTableUuid']
    if (billingPriceTableUuid) {
      return {
        uuid: {
          [bindList ? ZOp.notIn : ZOp.in]: {
            [ZOp.getapi]: {
              action: ZQLAction.GET_API,
              api: 'GetAccountPriceTableRef',
              output: 'accountUuids',
              condition: {
                tableUuid: billingPriceTableUuid
              }
            }
          }
        }
      }
    }
  }

  getAccountQuotaInfo(uuid) {
    return this.accountQuotaInfoDataLoader.load(uuid)
  }

  _getAccountQuotaInfo = async (uuids: string[]) => {
    let p = null
    const task = []
    uuids.forEach(uuid => {
      p = this.getAccountQuotaUsageAction.call({ uuid })
      task.push(p)
    })
    const resp = await Promise.all(task)
    return uuids.map((_, index) => {
      const { usages = [] } = _get(resp, [index], {})
      if (usages?.length) {
        const volumeNum = usages?.filter(it => it?.name === 'volume.data.num')?.[0]?.used ?? 0
        return {
          volumeNum,
          usages
        }
      } else {
        return {
          volumeNum: 0,
          usages: []
        }
      }
    })
  }

  getVmNum(uuid) {
    return this.vmNumDataLoader.load(uuid)
  }

  _getVmNum = async (uuids: string[]) => {
    const genZql = accountUuid => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        condition: {
          type: 'UserVm',
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'accountResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType: 'VmInstanceVO',
                  accountUuid,
                  type: 'Own'
                }
              }
            },
            [ZOp.and]: [
              {
                uuid: {
                  [ZOp.notIn]: {
                    [ZOp.query]: {
                      tableName: 'templatedVminstance',
                      fields: ['uuid']
                    }
                  }
                }
              },
              {
                uuid: {
                  [ZOp.notIn]: {
                    [ZOp.query]: {
                      tableName: 'templatedVminstanceCache',
                      fields: ['cacheVmInstanceUuid']
                    }
                  }
                }
              }
            ]
          }
        },
        namedAs: accountUuid
      }
    }

    const zql = ZQL.multStringify(uuids.map(uuid => genZql(uuid)))
    const { results = [] } = await this.zqlService.call(zql)

    const map = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, 'total', 0)
        return obj
      },
      {}
    )

    return uuids.map(uuid => map[uuid] ?? 0)
  }

  getVolumeNum(uuid) {
    return this.volumeNumDataLoader.load(uuid)
  }

  _getVolumeNum = async (uuids: string[]) => {
    const genZql = accountUuid => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'Volume',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'accountResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType: 'VolumeVO',
                  accountUuid,
                  type: 'Own'
                }
              }
            }
          }
        },
        namedAs: accountUuid
      }
    }

    const zql = ZQL.multStringify(uuids.map(uuid => genZql(uuid)))
    const { results = [] } = await this.zqlService.call(zql)

    const map = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, 'total', 0)
        return obj
      },
      {}
    )

    return uuids.map(uuid => map[uuid] ?? 0)
  }

  getRole = (accountUuid: string) => {
    return this.roleDataloader.load(accountUuid)
  }

  _getRole = async (accountUuids: string[]) => {
    const genZql = (accountUuid: string) => {
      return {
        action: ZQLAction.QUERY,
        tableName: 'Role',
        fields: ['uuid', 'name', 'type'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'RoleAccountRef',
                fields: ['roleUuid'],
                condition: {
                  accountUuid,
                  accountPermissionFrom: {
                    [ZOp.is]: null
                  },
                  roleUuid: {
                    [ZOp.ne]: Constant.zsvRoleMap.PREDEFINEDOTHERUUID
                  }
                }
              }
            }
          }
        },
        namedAs: accountUuid
      }
    }
    const zql = ZQL.multStringify(accountUuids.map(accountUuid => genZql(accountUuid)))
    const { results = [] } = await this.zqlService.call(zql)

    const roleMap = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, ['inventories'], {})
        return obj
      },
      {}
    )
    return accountUuids.map(accountUuid => {
      const role = roleMap[accountUuid]
      if (role.length) {
        return role
      } else {
        return []
      }
    })
  }

  getRoleFromAccountGroup = (accountUuid: string) => {
    return this.roleFromAccountGroupDataloader.load(accountUuid)
  }

  _getRoleFromAccountGroup = async (accountUuids: string[]) => {
    const genZql = (accountUuid: string) => {
      return {
        action: ZQLAction.QUERY,
        tableName: 'Role',
        fields: ['uuid', 'name', 'type'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'RoleAccountRef',
                fields: ['roleUuid'],
                condition: {
                  accountUuid,
                  accountPermissionFrom: {
                    [ZOp.not]: null
                  },
                  roleUuid: {
                    [ZOp.ne]: Constant.zsvRoleMap.PREDEFINEDOTHERUUID
                  }
                }
              }
            }
          }
        },
        namedAs: accountUuid
      }
    }
    const zql = ZQL.multStringify(accountUuids.map(accountUuid => genZql(accountUuid)))
    const { results = [] } = await this.zqlService.call(zql)

    const roleMap = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, ['inventories'], {})
        return obj
      },
      {}
    )
    return accountUuids.map(accountUuid => {
      const role = roleMap[accountUuid]
      if (role.length) {
        return role
      } else {
        return []
      }
    })
  }
}
