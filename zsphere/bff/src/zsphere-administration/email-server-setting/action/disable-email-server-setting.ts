import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ChangeSNSApplicationPlatformStateAction } from '@/api/zstack/ChangeSNSApplicationPlatformStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DisableEmailServerPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DisableEmailServerInput {
  @Field(() => [DisableEmailServerPayload])
  payload: DisableEmailServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DisableEmailServerService extends ActionService {
  @Inject()
  action: ChangeSNSApplicationPlatformStateAction

  @Mutation(() => ActionResult)
  disableEmailServerSettings(@Args('input') input: DisableEmailServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EmailServerSetting',
      async (payload: DisableEmailServerPayload, taskId: string) => {
        const { uuid } = payload
        const { inventory } = await this.action.call(
          {
            uuid,
            stateEvent: 'disable'
          },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'state',
          inventory
        }
      }
    )
    return { actionId }
  }
}
