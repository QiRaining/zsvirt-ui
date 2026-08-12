import { ModuleRef, ContextIdFactory } from '@nestjs/core'
import * as _ from 'lodash'

import { UIPrivilegeService } from '@/common/ui-privilege/ui-privilege.service'

export function Auth(privilegeKey: string): any {
  return (target: Record<string, any>, key?: string, descriptor?: any) => {
    const value = _.cloneDeep(descriptor)
    descriptor.value = async function (...args) {
      const sessionId = this.getSessionId()
      const moduleRef = this.moduleRef as ModuleRef
      if (!moduleRef) {
        throw new Error('ModuleRef not found in context')
      }
      const contextId = ContextIdFactory.create()

      // 获取 UIPrivilegeService 实例
      const privilegeService = await this.moduleRef.resolve(UIPrivilegeService, contextId, {
        strict: false
      })
      if (!privilegeService) {
        throw new Error('UIPrivilegeService not found')
      }

      // 检查权限并返回session信息
      await privilegeService.checkPrivilege(sessionId, privilegeKey)
      return value.value.apply(this, args)
    }
  }
}
