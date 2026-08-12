import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateBaremetalPxeServerAction } from '@/api/zstack/UpdateBaremetalPxeServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateBaremetalPxeServerPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string
}

@InputType()
class UpdateBaremetalPxeServerInput {
  @Field(() => [UpdateBaremetalPxeServerPayload])
  payload: UpdateBaremetalPxeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateBaremetalPxeServerService extends ActionService {
  @Inject() updateBaremetalPxeServerAction: UpdateBaremetalPxeServerAction

  @Mutation(() => ActionResult)
  updateBaremetalPxeServer(@Args('input') input: UpdateBaremetalPxeServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalPxeServer',
      async (payload: UpdateBaremetalPxeServerPayload, taskId: string) => {
        const { inventory } = await this.updateBaremetalPxeServerAction.call(
          { ...payload },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'name,description',
          inventory
        }
      }
    )
    return { actionId }
  }
}
