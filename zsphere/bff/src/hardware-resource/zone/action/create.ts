import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateZoneAction } from '@/api/zstack/CreateZoneAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateZonePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
export class CreateZoneInput {
  @Field(() => CreateZonePayload)
  payload: CreateZonePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateZoneService extends ActionService {
  @Inject() createAction: CreateZoneAction

  @Mutation(() => ActionResult)
  createZone(@Args('input') input: CreateZoneInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Zone', async (payload: CreateZonePayload, taskId: string) => {
      const { inventory } = await this.createAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: inventory.uuid,
        inventory
      }
    })
    return { actionId }
  }
}
