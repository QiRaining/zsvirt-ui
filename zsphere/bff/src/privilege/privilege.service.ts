import { Inject, Injectable, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'

import { GetRolePolicyActionsAction } from '@/api/zstack/GetRolePolicyActionsAction'
import Constant from '@/common/const'
import { ZsRolePrivilege } from '@/model/zs-role-privilege.model'
/**
 * 权限服务：负责全局校验权限，逻辑与 getUiPrivileges 保持一致
 */
@Injectable({
  scope: Scope.DEFAULT // 全局单例
})
export class PrivilegeService {
  @Inject() configService: ConfigService
  @Inject() getRolePolicyActions: GetRolePolicyActionsAction
  @InjectModel(ZsRolePrivilege) private zsRolePrivilege: typeof ZsRolePrivilege

  /**
   * 校验当前用户是否有 UI 权限：
   * 如果 customUIPrivilege==='{}' 且 systemRoles.length!==0，返回 false，否则返回 true。
   */
  async hasPrivilege(): Promise<boolean> {
    if (this.configService.get('ZS_UI_PRIV_CHECK') !== 'true') {
      return true
    }
    try {
      const { roles = [] } = await this.getRolePolicyActions.call({
        showAllPolicies: false
      })
      // 获取 systemRoles
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
      // 获取 customUIPrivilege
      const uiPrivileges = await this.zsRolePrivilege.findAll({
        where: {
          roleUuid: roles.map(item => item.uuid)
        }
      })
      // 合成 customUIPrivilege
      let privilege = {}
      if (uiPrivileges.length > 0) {
        privilege = uiPrivileges.reduce((acc, item) => {
          Object.assign(acc, item.privilege)
          return acc
        }, {})
      }
      const customUIPrivilege = JSON.stringify(privilege)
      if (
        customUIPrivilege === '{}' &&
        systemRoles.length === 1 &&
        systemRoles?.[0]?.name === 'Other'
      ) {
        return false
      }
      return true
    } catch (error) {
      return false
    }
  }
}
