import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateThirdpartyPlatformAction } from '@/api/zstack/UpdateThirdpartyPlatformAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateThirdpartyPlatformPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  stateEvent: string

  @Field(() => String, { nullable: true })
  template: string

  @Field(() => String, { nullable: true })
  description: string
}

@InputType()
class UpdateThirdpartyPlatformInput {
  @Field(() => [UpdateThirdpartyPlatformPayload])
  payload: UpdateThirdpartyPlatformPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateThirdpartyPlatformService extends ActionService {
  @Inject() updateThirdpartyPlatformAction: UpdateThirdpartyPlatformAction

  @Mutation(() => ActionResult)
  updateThirdpartyPlatform(@Args('input') input: UpdateThirdpartyPlatformInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ThirdpartyPlatform',
      async (payload: UpdateThirdpartyPlatformPayload, taskId: string) => {
        const { inventory } = await this.updateThirdpartyPlatformAction.call(
          { ...payload },
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
