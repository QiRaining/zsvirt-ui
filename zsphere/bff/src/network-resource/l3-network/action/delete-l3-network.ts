import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteL3NetworkAction } from '@/api/zstack/DeleteL3NetworkAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteL3NetworkPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteL3NetworkInput {
  @Field(() => [DeleteL3NetworkPayload])
  payload: DeleteL3NetworkPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteL3NetworkService extends ActionService {
  @Inject() deleteL3NetworkAction: DeleteL3NetworkAction

  @Mutation(() => ActionResult)
  deleteL3Network(@Args('input') input: DeleteL3NetworkInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteL3NetworkPayload, taskId: string) => {
      await this.deleteL3NetworkAction.call(payload, {
        actionId,
        taskId
      })

      return {
        id: payload.uuid,
        inventory: {
          actionType: 'delete',
          id: payload.uuid
        }
      }
    }

    this.actionHelper(input, 'L3Network', actionFn)
    return {
      actionId
    }
  }
}
