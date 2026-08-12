import { existsSync } from 'fs'
import { join } from 'path'

import { Injectable, Inject, UnauthorizedException } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetRolePolicyActionsAction } from '@/api/zstack/GetRolePolicyActionsAction'
import * as IAM1Admin from '@/auth/iam1/Admin.zsv.json'
import * as IAM1AuditAdmin from '@/auth/iam1/IAM1AuditAdmin.json'
import * as IAM1ResourceViewer from '@/auth/iam1/IAM1ResourceViewer.json'
import * as IAM1SecurityAdmin from '@/auth/iam1/IAM1SecurityAdmin.json'
import * as IAM1SystemAdmin from '@/auth/iam1/IAM1SystemAdmin.json'
import * as NormalAccountZsv from '@/auth/iam1/NormalAccount.zsv.json'
import * as VirtualMachineUser from '@/auth/iam1/VirtualMachineUser.zsv.json'
import { Cache, CacheService } from '@/common/cache'
import Constant from '@/common/const'
import { Identity } from '@/identity/model/login.model'
import { ZsRolePrivilege } from '@/model/zs-role-privilege.model'
import { ZsSession } from '@/model/zs-session.model'

import { isSodOrResourceViewerRole, isVirtualMachineUserRole } from './utils'

type AuthMap = Record<string, string>

@Injectable()
export class UIPrivilegeService {
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @Inject(CONTEXT) protected readonly context
  @Inject() zqlService: ZQLService
  @InjectModel(ZsRolePrivilege) private zsRolePrivilege: typeof ZsRolePrivilege
  @Inject() getRolePolicyActions: GetRolePolicyActionsAction

  // @Cache 装饰器通过 this.cacheService 在运行时访问
  @Inject() private cacheService: CacheService

  async checkPrivilege(sessionId: string, privilegeKey: string): Promise<boolean> {
    if (!sessionId) {
      throw new UnauthorizedException('Session not found')
    }

    const { uiPrivileges } = await this.getUiPrivileges(sessionId)

    const hasPrivilege = uiPrivileges.some(([key]) => key === privilegeKey)

    if (!hasPrivilege) {
      throw new UnauthorizedException('No permission for this operation')
    }

    return true
  }

  /**
   * 获取用户权限的主入口
   */
  async getUserAuth(session: ZsSession): Promise<AuthMap> {
    if (session.type !== 'Account') {
      return {}
    }

    const { roles = [] } = await this.getRolePolicyActions.call({
      showAllPolicies: false
    })

    if (session.identity === Identity.Admin) {
      if (session.accountId === Constant.zsvRoleMap.ADMIN_UUID) {
        return this.normalizeAuthMap(IAM1Admin)
      } else if (roles.some(role => isSodOrResourceViewerRole(role.uuid))) {
        const sodAuth = this.getSodRoleAuth(session, roles)

        if (Object.keys(sodAuth).length > 0) {
          return sodAuth
        }
      } else {
        return this.normalizeAuthMap(IAM1Admin)
      }
    }

    return await this.getCustomRolesAuth(session, roles)
  }

  /**
   * 获取SOD角色权限
   * 逻辑：根据 roles 列表中的 UUID 匹配对应的内置权限对象
   */
  private getSodRoleAuth(session: ZsSession, roles: any[]): AuthMap {
    if (session.identity !== Identity.Admin) {
      return {}
    }

    const sodRoleMap: Record<string, AuthMap> = {
      [Constant.zsvRoleMap.PREDEFINEDSODSYSTEMADMINUUID]: this.normalizeAuthMap(IAM1SystemAdmin), // 系统管理员
      [Constant.zsvRoleMap.PREDEFINEDSODSECURITYADMINUUID]: this.normalizeAuthMap(IAM1SecurityAdmin), // 安全管理员
      [Constant.zsvRoleMap.PREDEFINEDSODAUDITORUUID]: this.normalizeAuthMap(IAM1AuditAdmin), // 审计管理员
      [Constant.zsvRoleMap.PREDEFINEDRESOURCEVIEWERUUID]: this.normalizeAuthMap(IAM1ResourceViewer) // 只读角色
    }

    for (const role of roles) {
      if (role.uuid && sodRoleMap[role.uuid]) {
        return sodRoleMap[role.uuid]
      }
    }

    return {}
  }

  async getCustomRolesAuth(session: ZsSession, roles): Promise<AuthMap> {
    const uiPrivileges = await this.zsRolePrivilege.findAll({
      where: {
        roleUuid: roles.map(item => item.uuid)
      }
    })

    // 1. 获取根据 UI 权限表计算出的权限
    const customUiAuth = this.buildPrivilegeFromUiPrivileges(uiPrivileges)

    // 2. 判断是否属于基础权限范畴 (Legacy 账号)
    const isLegacy = this.isLegacyAccount(roles)

    if (isLegacy) {
      const virtualMachineUserAuth = this.normalizeAuthMap(VirtualMachineUser)
      if (uiPrivileges.length === 0) {
        return virtualMachineUserAuth
      }

      return _.assign({}, virtualMachineUserAuth, customUiAuth)
    }

    if (session.identity === Identity.NormalAccount) {
      const baseIamAuth = this.getIam1NormalAccountBaseStaticAuth(roles)
      if (uiPrivileges.length === 0) {
        return baseIamAuth
      }
      return _.assign({}, baseIamAuth, customUiAuth)
    }

    return customUiAuth
  }

  /**
   * 绑定虚拟机用户预置角色用 VirtualMachineUser.zsv，否则用 NormalAccount.zsv。
   */
  private getIam1NormalAccountBaseStaticAuth(
    roles: Array<{ uuid: string }>
  ): AuthMap {
    const hasVMUserRole = roles.some(role => isVirtualMachineUserRole(role.uuid))
    return hasVMUserRole
      ? this.normalizeAuthMap(VirtualMachineUser)
      : this.normalizeAuthMap(NormalAccountZsv)
  }

  /**
   * 判断是否为遗留账户
   */
  private isLegacyAccount(roles: Array<{ type: string; name: string }>): boolean {
    return roles.some(role => role.type === 'Predefined' && role.name.includes('legacy'))
  }

  /**
   * 从UI权限数据构建权限对象
   */
  private buildPrivilegeFromUiPrivileges(uiPrivileges: ZsRolePrivilege[]): AuthMap {
    return uiPrivileges.reduce(
      (acc, item) => {
        _.forEach(item.privilege, (value: any, key: string) => {
          // 处理actions权限
          value.actions?.forEach((actionKey: string) => {
            const privilegeKey = `${key}||action||${actionKey}`
            if (!acc[privilegeKey]) {
              acc[privilegeKey] = 'hidden'
            }
          })

          // 处理views权限
          value.views?.forEach((viewType: 'list' | 'detail') => {
            const privilegeKey = `${value.viewKey}||view||${viewType}`
            if (!acc[privilegeKey]) {
              acc[privilegeKey] = 'hidden'
            }
          })
        })
        return acc
      },
      {} as Record<string, string>
    )
  }

  async getOemAuth(): Promise<Array<[string, string]> | undefined> {
    const oemAuthPath = join(__dirname, '../../auth/oem/oem.json')

    if (!existsSync(oemAuthPath)) {
      return undefined
    }

    try {
      const authData = require(oemAuthPath)
      return this.toAuthEntries(authData)
    } catch (error) {
      console.error(`[Auth Server]: Failed to load OEM auth`, error)
      return undefined
    }
  }

  private normalizeAuthMap(auth: unknown): AuthMap {
    if (!auth || typeof auth !== 'object' || Array.isArray(auth)) {
      return {}
    }

    const record = auth as Record<string, unknown>
    const normalizeRecord = (source: Record<string, unknown>) =>
      Object.entries(source).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value
        }
        return acc
      }, {} as AuthMap)

    const directAuth = normalizeRecord(record)
    if (Object.keys(directAuth).length > 0) {
      return directAuth
    }

    if (!record.default || typeof record.default !== 'object' || Array.isArray(record.default)) {
      return {}
    }

    return Object.entries(record.default as Record<string, unknown>).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value
      }
      return acc
    }, {} as AuthMap)
  }

  private toAuthEntries(auth: unknown): Array<[string, string]> {
    return Object.entries(this.normalizeAuthMap(auth))
  }

  @Cache({ ttl: 60 })
  async getUiPrivileges(sessionId?: string): Promise<{
    uiPrivileges: Array<[string, string]>
  }> {
    const session = await this.zsSession.findOne({
      where: { sessionId }
    })

    if (!session) {
      throw new UnauthorizedException('Invalid session')
    }

    const [roleAuth, oemAuth] = await Promise.all([
      this.getUserAuth(session),
      this.getOemAuth()
    ])

    const roleAuthEntries = this.toAuthEntries(roleAuth)
    const authList = oemAuth?.length ? [roleAuthEntries, oemAuth] : [roleAuthEntries]

    const uiPrivileges = _.intersectionBy(...authList, ([key]) => key)

    return {
      uiPrivileges
    }
  }
}
