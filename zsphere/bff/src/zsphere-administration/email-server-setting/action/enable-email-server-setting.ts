import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ChangeSNSApplicationPlatformStateAction } from '@/api/zstack/ChangeSNSApplicationPlatformStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class EnableEmailServerPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class EnableEmailServerInput {
  @Field(() => [EnableEmailServerPayload])
  payload: EnableEmailServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EnableEmailServerService extends ActionService {
  @Inject()
  action: ChangeSNSApplicationPlatformStateAction

  @Mutation(() => ActionResult)
  enableEmailServerSettings(@Args('input') input: EnableEmailServerInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: EnableEmailServerPayload, taskId: string) => {
      const { uuid } = payload
      const { inventory } = await this.action.call(
        {
          uuid,
          stateEvent: 'enable'
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        fields: 'state',
        inventory
      }
    }

    this.actionHelper(input, 'EmailServerSetting', actionFn)

    return { actionId }
  }
}
