import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateZoneAction } from '@/api/zstack/UpdateZoneAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateZonePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { nullable: true })
  isDefault?: boolean
}

@InputType()
export class UpdateZoneInput {
  @Field(() => UpdateZonePayload)
  payload: UpdateZonePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateZoneService extends ActionService {
  @Inject() updateAction: UpdateZoneAction

  @Mutation(() => ActionResult)
  updateZone(@Args('input') input: UpdateZoneInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Zone', async (payload: UpdateZonePayload, taskId: string) => {
      const { uuid } = payload
      const { inventory } = await this.updateAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: uuid,
        fields: 'name,description,isDefault',
        inventory
      }
    })
    return { actionId }
  }
}
