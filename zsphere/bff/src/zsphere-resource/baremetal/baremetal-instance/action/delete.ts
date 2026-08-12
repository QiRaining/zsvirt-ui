import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DestroyBaremetalInstanceAction } from '@/api/zstack/DestroyBaremetalInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteBaremetalInstancePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteBaremetalInstanceInput {
  @Field(() => [DeleteBaremetalInstancePayload])
  payload: DeleteBaremetalInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteBaremetalInstanceService extends ActionService {
  @Inject()
  destroyBaremetalInstanceAction: DestroyBaremetalInstanceAction

  @Mutation(() => ActionResult)
  deleteBaremetalInstance(@Args('input') input: DeleteBaremetalInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalInstance',
      async (payload: DeleteBaremetalInstancePayload, taskId: string) => {
        const { uuid } = payload
        await this.destroyBaremetalInstanceAction.call(
          {
            uuid
          },
          { actionId, taskId }
        )
        return {
          id: uuid
        }
      }
    )
    return { actionId }
  }
}
