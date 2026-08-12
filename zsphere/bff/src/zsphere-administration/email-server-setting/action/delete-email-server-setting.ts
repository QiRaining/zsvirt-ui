import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteSNSApplicationPlatformAction } from '@/api/zstack/DeleteSNSApplicationPlatformAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteSNSEmailPlatformPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteSNSEmailPlatformInput {
  @Field(() => [DeleteSNSEmailPlatformPayload])
  payload: DeleteSNSEmailPlatformPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteEmailServerSettingService extends ActionService {
  @Inject()
  deleteSNSApplicationPlatformAction: DeleteSNSApplicationPlatformAction

  @Mutation(() => ActionResult)
  deleteSNSEmailServer(@Args('input') input: DeleteSNSEmailPlatformInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EmailServerSetting',
      async (payload: DeleteSNSEmailPlatformPayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteSNSApplicationPlatformAction.call(
          { uuid },
          {
            actionId,
            taskId
          }
        )
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
