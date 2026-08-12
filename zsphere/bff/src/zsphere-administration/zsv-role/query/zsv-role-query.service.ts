import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { Condition as ICondition, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetRolePolicyActionsAction } from '@/api/zstack/GetRolePolicyActionsAction'
import * as IAM1AuditAdmin from '@/auth/iam1/IAM1AuditAdmin.json'
import * as IAM1ResourceViewer from '@/auth/iam1/IAM1ResourceViewer.json'
import * as IAM1SecurityAdmin from '@/auth/iam1/IAM1SecurityAdmin.json'
import * as IAM1SystemAdmin from '@/auth/iam1/IAM1SystemAdmin.json'
import * as VirtualMachineUser from '@/auth/iam1/VirtualMachineUser.zsv.json'
import Constant from '@/common/const'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { ZsRolePrivilege } from '@/model/zs-role-privilege.model'

import { formateUiPrivilegeByJson } from '../action/utils'
import { filterApis } from '../action/utils'
import { ZsvRoleQueryType, QueryZsvRoleArgs, ZsvRole } from '../zsv-role.model'

@Injectable()
export class ZsvRoleQueryService {
  @Inject() private zqlService: ZQLService
  @Inject() getRolePolicyActions: GetRolePolicyActionsAction
  @InjectModel(ZsRolePrivilege) private zsRolePrivilege: typeof ZsRolePrivilege

  private userCountDataloader
  private userGroupCountDataloader
  private getUiPrivilegeDataLoder
  private getPoliciesDataLoder

  constructor() {
    this.getUiPrivilegeDataLoder = new DataLoader(this._getUiPrivilege)
    this.userCountDataloader = new DataLoader(this._getUserCount)
    this.userGroupCountDataloader = new DataLoader(this._getUserGroupCount)
    this.getPoliciesDataLoder = new DataLoader(this._getPolicies)
  }

  private buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async get(params: QueryZsvRoleArgs) {
    const { type = ZsvRoleQueryType.Normal } = params
    let _extrazqlConditions: unknown

    switch (type) {
      case ZsvRoleQueryType.Customized:
        _extrazqlConditions = {
          type: 'Customized'
        }
        break
      case ZsvRoleQueryType.Predefined:
        _extrazqlConditions = {
          type: 'Predefined'
        }
        break
      case ZsvRoleQueryType.GET_ROLE_BY_ACCOUNT:
        _extrazqlConditions = this.getRoleByAccount(params)
        break
      case ZsvRoleQueryType.GET_ROLE_BY_USERGROUP:
        _extrazqlConditions = this.getRoleByUserGroup(params)
        break
      case ZsvRoleQueryType.GET_ROLE_FOR_MANAGEMENT:
        _extrazqlConditions = {
          [ZOp.or]: [
            { type: 'Customized' },
            {
              uuid: {
                [ZOp.in]: [
                  Constant.zsvRoleMap.PREDEFINEDLEGACYUUID,
                  Constant.zsvRoleMap.PREDEFINEDSODSYSTEMADMINUUID,
                  Constant.zsvRoleMap.PREDEFINEDSODSECURITYADMINUUID,
                  Constant.zsvRoleMap.PREDEFINEDSODAUDITORUUID,
                  Constant.zsvRoleMap.PREDEFINEDRESOURCEVIEWERUUID
                ]
              }
            }
          ]
        }
        break
      case ZsvRoleQueryType.GET_ROLE_FOR_MANAGEMENT_WITH_ACCOUNT_AND_USERGROUP:
        _extrazqlConditions = {
          [ZOp.or]: [
            { type: 'Customized' },
            {
              uuid: {
                [ZOp.in]: [Constant.zsvRoleMap.PREDEFINEDLEGACYUUID]
              }
            }
          ]
        }
        break
      case ZsvRoleQueryType.GET_ROLE_FOR_MANAGEMENT_WITH_PREDEFINED_SYSTEM_ACCOUNT:
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: [
              Constant.zsvRoleMap.PREDEFINEDSODSYSTEMADMINUUID,
              Constant.zsvRoleMap.PREDEFINEDSODSECURITYADMINUUID,
              Constant.zsvRoleMap.PREDEFINEDSODAUDITORUUID,
              Constant.zsvRoleMap.PREDEFINEDRESOURCEVIEWERUUID
            ]
          }
        }
        break
    }

    const _zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    const zqlObject = {
      tableName: 'Role',
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

  getRoleByAccount(params) {
    const conditionsMap = conditionsToObject(params?.extraConditions)
    const accountUuid = conditionsMap?.['accountUuid']
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'RoleAccountRef',
            fields: ['roleUuid'],
            condition: {
              accountUuid,
              accountPermissionFrom: {
                [ZOp.is]: null
              }
            }
          }
        }
      }
    }
  }

  getRoleByUserGroup(params) {
    const conditionsMap = conditionsToObject(params?.extraConditions)
    const userGroupUuid = conditionsMap?.['userGroupUuid']
    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'AccountGroupRoleRef',
            fields: ['roleUuid'],
            condition: {
              groupUuid: userGroupUuid
            }
          }
        }
      }
    }
  }

  getUiPrivilege(role: ZsvRole) {
    return this.getUiPrivilegeDataLoder.load(role)
  }

  _getUiPrivilege = async (roles: ZsvRole[]) => {
    const uiPrivileges = await this.zsRolePrivilege.findAll({
      where: {
        roleUuid: roles.map(role => role.uuid)
      }
    })
    return roles.map(role => {
      const uiPrivilege = uiPrivileges.find(item => item.roleUuid === role.uuid)
      //ui表里存在为 ui 创建角色
      if (uiPrivilege) {
        return JSON.stringify(uiPrivilege.privilege)
      }
      /**
       * 默认角色:
       *   - 虚拟机用户角色
       *   - 系统管理员角色
       *   - 安全管理员角色
       *   - 审计员角色
       */
      const configMap = {
        [Constant.zsvRoleMap.PREDEFINEDLEGACYUUID]: VirtualMachineUser,
        [Constant.zsvRoleMap.PREDEFINEDSODSYSTEMADMINUUID]: IAM1SystemAdmin,
        [Constant.zsvRoleMap.PREDEFINEDSODSECURITYADMINUUID]: IAM1SecurityAdmin,
        [Constant.zsvRoleMap.PREDEFINEDSODAUDITORUUID]: IAM1AuditAdmin,
        [Constant.zsvRoleMap.PREDEFINEDRESOURCEVIEWERUUID]: IAM1ResourceViewer
      }
      const formateUiPrivilege = configMap[role.uuid]

      return JSON.stringify(formateUiPrivilegeByJson(formateUiPrivilege))
    })
  }

  getPolicies(role: ZsvRole) {
    return this.getPoliciesDataLoder.load(role)
  }

  _getPolicies = async (role: ZsvRole[]) => {
    const { policies = [] } = await this.getRolePolicyActions.call({
      showAllPolicies: true
    })
    return role.map(role => {
      if (role.uuid === Constant.zsvRoleMap.PREDEFINEDLEGACYUUID) {
        return filterApis(role.policies, policies)
      }
      return role.policies
    })
  }

  getUserCount = (roleUuid: string) => {
    return this.userCountDataloader.load(roleUuid)
  }

  _getUserCount = async (roleUuids: string[]) => {
    const genZql = (roleUuid: string) => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'Account',
        condition: {
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
        },
        namedAs: roleUuid
      }
    }
    const zql = ZQL.multStringify(roleUuids.map(roleUuid => genZql(roleUuid)))
    const { results = [] } = await this.zqlService.call(zql)
    const map = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, 'total', 0)
        return obj
      },
      {}
    )
    return roleUuids.map(roleUuid => {
      const count = map[roleUuid]
      if (count) {
        return count
      } else {
        return 0
      }
    })
  }

  getUserGroupCount = (roleUuid: string) => {
    return this.userGroupCountDataloader.load(roleUuid)
  }

  _getUserGroupCount = async (roleUuids: string[]) => {
    const genZql = (roleUuid: string) => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'AccountGroup',
        condition: {
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
        },
        namedAs: roleUuid
      }
    }
    const zql = ZQL.multStringify(roleUuids.map(roleUuid => genZql(roleUuid)))
    const { results = [] } = await this.zqlService.call(zql)
    const map = _.reduce(
      results,
      (obj, it) => {
        obj[it.name] = _.get(it, 'total', 0)
        return obj
      },
      {}
    )
    return roleUuids.map(roleUuid => {
      const count = map[roleUuid]
      if (count) {
        return count
      } else {
        return 0
      }
    })
  }

  getUiPrivileges = async () => {
    try {
      const { roles = [] } = await this.getRolePolicyActions.call({
        showAllPolicies: false
      })

      if (roles.length === 0) {
        return {
          systemRoles: [],
          customRoles: [],
          customUIPrivilege: JSON.stringify({})
        }
      }

      const uiPrivileges = await this.zsRolePrivilege.findAll({
        where: {
          roleUuid: roles.map(item => item.uuid)
        }
      })

      const systemRoles =
        _.uniqBy(
          roles
            .filter(item => item.type === 'Predefined')
            .map(item => {
              return {
                name: Constant.zsvIdentityMap[item.uuid],
                uuid: item.uuid
              }
            }),
          'uuid'
        ) || []

      const customRoles = roles.filter(item => item.type === 'Customized')

      const isLegacyAccount = roles.some(
        role => role.type === 'Predefined' && role.name.includes('legacy')
      )

      let privilege = {}

      if (customRoles.length > 0) {
        /**
         * 4.10.0之前升级上来的用户默认给虚拟机用户权限
         * 绑定了默认虚拟机用户角色，给虚拟机用户权限
         */
        if (uiPrivileges.length === 0 && isLegacyAccount) {
          privilege = VirtualMachineUser
        } else {
          //用户绑了自定义角色，则获取自定义角色的权限
          privilege = uiPrivileges?.reduce((acc, item) => {
            _.forEach(item.privilege, (value: any, key) => {
              value.actions.forEach((actionKey: string) => {
                const privilegeKey = `${key}||action||${actionKey}`
                if (!acc[privilegeKey]) {
                  acc[privilegeKey] = 'hidden'
                }
              })
              value.views.forEach((viewType: 'list' | 'detail') => {
                const privilegeKey = `${value.viewKey}||view||${viewType}`
                if (!acc[privilegeKey]) {
                  acc[privilegeKey] = 'hidden'
                }
              })
            })
            return acc
          }, {})
        }
      }

      return {
        systemRoles: systemRoles,
        customRoles: customRoles,
        customUIPrivilege: JSON.stringify(privilege)
      }
    } catch (error) {
      console.error('Error fetching UI privileges:', error)
      return {
        systemRoles: [],
        customRoles: [],
        customUIPrivilege: JSON.stringify({})
      }
    }
  }
}
