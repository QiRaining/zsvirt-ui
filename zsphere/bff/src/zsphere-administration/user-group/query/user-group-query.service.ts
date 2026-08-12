import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import _, { compact as _compact, reduce as _reduce, get as _get } from 'lodash'

import { Condition as ICondition, Op, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { UserGroupQueryType, QueryUserGroupArgs } from '../user-group.model'

@Injectable()
export class UserGroupQueryService {
  @Inject() private zqlService: ZQLService

  private groupUserCountDataloader
  private roleDataloader

  constructor() {
    this.groupUserCountDataloader = new DataLoader(this._getGroupUserCount)
    this.roleDataloader = new DataLoader(this._getRole)
  }

  private buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async get(params: QueryUserGroupArgs) {
    const { type = UserGroupQueryType.Normal } = params
    let _extrazqlConditions

    switch (type) {
      case UserGroupQueryType.Normal:
        break

      case UserGroupQueryType.GET_USERGROUP_BY_ACCOUNT:
        _extrazqlConditions = this.getUserGroupByAccount({ params })
        break
      case UserGroupQueryType.GET_USERGROUP_BY_NOT_ACCOUNT:
        _extrazqlConditions = this.getUserGroupByAccount({
          params,
          isIn: false
        })
        break
      case UserGroupQueryType.GET_USERGROUP_BY_ROLE:
        _extrazqlConditions = this.getUserGroupByRole(params)
        break
      case UserGroupQueryType.GET_USERGROUP_BY_SHARED:
        _extrazqlConditions = this.getUserGroupByShared({ params })
        break
      case UserGroupQueryType.GET_USERGROUP_BY_NOT_SHARED:
        _extrazqlConditions = this.getUserGroupByShared({
          params,
          isShare: false
        })
        break
    }

    const _zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    const zqlObject = {
      tableName: 'AccountGroup',
      condition: _zqlCondition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)

    return {
      list: resp.results[0].inventories ?? [],
      total: resp.results[0].total ?? 0
    }
  }

  getUserGroupByAccount({ params, isIn = true }) {
    const conditionsMap = conditionsToObject(params?.extraConditions)
    const accountUuid = conditionsMap?.['accountUuid']
    return {
      uuid: {
        [isIn ? ZOp.in : ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'AccountGroupAccountRef',
            fields: ['groupUuid'],
            condition: {
              accountUuid
            }
          }
        }
      }
    }
  }

  getUserGroupByRole(params) {
    const conditionsMap = conditionsToObject(params?.extraConditions)
    const roleUuid = conditionsMap?.['roleUuid']
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'AccountGroupRoleRef',
            fields: ['groupUuid'],
            condition: {
              roleUuid
            }
          }
        }
      }
    }
  }

  getUserGroupByShared({ params, isShare = true }) {
    const conditionsMap = conditionsToObject(params?.extraConditions)
    const resourceUuid = conditionsMap?.['resourceUuid']
    return {
      uuid: {
        [isShare ? ZOp.in : ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'AccountGroupResourceRef',
            fields: ['groupUuid'],
            condition: {
              resourceUuid
            }
          }
        }
      }
    }
  }

  getGroupUserCount = (userGroupUuid: string) => {
    return this.groupUserCountDataloader.load(userGroupUuid)
  }

  _getGroupUserCount = async (userGroupUuids: string[]) => {
    const genZql = (userGroupUuid: string) => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'Account',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'AccountGroupAccountRef',
                fields: ['accountUuid'],
                condition: {
                  groupUuid: {
                    [ZOp.eq]: userGroupUuid
                  }
                }
              }
            }
          }
        },
        namedAs: userGroupUuid
      }
    }
    const zql = ZQL.multStringify(userGroupUuids.map(userGroupUuid => genZql(userGroupUuid)))
    const { results = [] } = await this.zqlService.call(zql)
    const map = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, 'total', 0)
        return obj
      },
      {}
    )
    return userGroupUuids.map(userGroupUuid => {
      const count = map[userGroupUuid]
      if (count) {
        return count
      } else {
        return 0
      }
    })
  }

  getRole = (userGroupUuid: string) => {
    return this.roleDataloader.load(userGroupUuid)
  }

  _getRole = async (userGroupUuids: string[]) => {
    const genZql = (userGroupUuid: string) => {
      return {
        tableName: 'Role',
        fields: ['uuid', 'name', 'type'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'AccountGroupRoleRef',
                fields: ['roleUuid'],
                condition: {
                  groupUuid: {
                    [ZOp.eq]: userGroupUuid
                  }
                }
              }
            }
          }
        },
        namedAs: userGroupUuid
      }
    }
    const zql = ZQL.multStringify(userGroupUuids.map(userGroupUuid => genZql(userGroupUuid)))
    const { results = [] } = await this.zqlService.call(zql)

    const roleMap = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, ['inventories'], [])
        return obj
      },
      {}
    )
    return userGroupUuids.map(userGroupUuid => {
      const role = roleMap[userGroupUuid]
      if (role.length) {
        return role
      } else {
        return []
      }
    })
  }
}
