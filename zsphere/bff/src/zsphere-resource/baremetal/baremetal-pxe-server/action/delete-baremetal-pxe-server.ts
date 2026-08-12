import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteBaremetalPxeServerAction } from '@/api/zstack/DeleteBaremetalPxeServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteBaremetalPxeServerPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteBaremetalPxeServerInput {
  @Field(() => [DeleteBaremetalPxeServerPayload])
  payload: DeleteBaremetalPxeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteBaremetalPxeServerService extends ActionService {
  @Inject() deleteBaremetalPxeServerAction: DeleteBaremetalPxeServerAction

  @Mutation(() => ActionResult)
  deleteBaremetalPxeServer(@Args('input') input: DeleteBaremetalPxeServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalPxeServer',
      async (payload: DeleteBaremetalPxeServerPayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteBaremetalPxeServerAction.call({ uuid }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
