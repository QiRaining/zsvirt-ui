import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { StopBaremetalPxeServerAction } from '@/api/zstack/StopBaremetalPxeServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class StopBaremetalPxeServerPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class StopBaremetalPxeServerInput {
  @Field(() => [StopBaremetalPxeServerPayload])
  payload: StopBaremetalPxeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class StopBaremetalPxeServerService extends ActionService {
  @Inject() stopBaremetalPxeServerAction: StopBaremetalPxeServerAction

  @Mutation(() => ActionResult)
  stopBaremetalPxeServer(@Args('input') input: StopBaremetalPxeServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalPxeServer',
      async (payload: StopBaremetalPxeServerPayload, taskId: string) => {
        const { uuid } = payload
        const result = await this.stopBaremetalPxeServerAction.call({ uuid }, { actionId, taskId })
        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
