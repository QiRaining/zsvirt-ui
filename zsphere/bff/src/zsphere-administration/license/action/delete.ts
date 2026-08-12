import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteLicenseAction } from '@/api/zstack/DeleteLicenseAction'
import { ActionService } from '@/base/action-service'
import { CacheService } from '@/common/cache'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { UIPrivilegeService } from '@/common/ui-privilege/ui-privilege.service'

import { LicenseService } from '../license.service'

@InputType()
class DeleteLicensePayload {
  @Field(() => String)
  managementNodeUuid: string

  @Field(() => String, { nullable: true })
  module: string
}

@InputType()
class DeleteLicenseInput {
  @Field(() => [DeleteLicensePayload])
  payload: DeleteLicensePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteLicenseService extends ActionService {
  @Inject() deleteLicenseAction: DeleteLicenseAction
  @Inject() cacheService: CacheService

  @Mutation(() => ActionResult)
  deleteLicense(@Args('input') input: DeleteLicenseInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'license', async (payload: DeleteLicensePayload, taskId) => {
      await this.deleteLicenseAction.call(payload, { actionId, taskId })
      LicenseService.clearAboutLicenseInfoCache()

      // 用于license的更新，需要清理当前session的auth计算结果，于下次请求时重新计算
      try {
        const sessionId = await this.getSessionId()
        const cacheKey = await this.cacheService.getCacheKey(
          UIPrivilegeService.name,
          'getUiPrivileges',
          [sessionId]
        )
        this.cacheService.del(cacheKey)
      } catch (e) {
        console.error(`[UI Privilege]: delete redis cache fail: `, e)
      }

      return {
        id: payload.managementNodeUuid
      }
    })
    return { actionId }
  }
}
