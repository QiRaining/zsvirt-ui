import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteHostAction } from '@/api/zstack/DeleteHostAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteHostPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteHostInput {
  @Field(() => [DeleteHostPayload])
  payload: DeleteHostPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteHostService extends ActionService {
  @Inject() deleteHostAction: DeleteHostAction

  @Mutation(() => ActionResult)
  deleteHosts(@Args('input') input: DeleteHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: DeleteHostPayload, taskId: string) => {
      const { uuid } = payload
      await this.deleteHostAction.call(
        {
          uuid
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        inventory: {
          actionType: 'delete',
          id: payload.uuid
        }
      }
    })
    return { actionId }
  }
}
