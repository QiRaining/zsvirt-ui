import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateHostAction, UpdateHostResult } from '@/api/zstack/UpdateHostAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateHostPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class UpdateHostInput {
  @Field(() => UpdateHostPayload)
  payload: UpdateHostPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateHostService extends ActionService {
  @Inject() updateHostAction: UpdateHostAction

  @Mutation(() => ActionResult)
  updateHost(@Args('input') input: UpdateHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: UpdateHostPayload, taskId: string) => {
      const result: UpdateHostResult = await this.updateHostAction.call(
        {
          ...payload
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
