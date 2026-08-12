import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteLogServerAction } from '@/api/zstack/DeleteLogServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteLogServerPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteLogServerInput {
  @Field(() => [DeleteLogServerPayload])
  payload: DeleteLogServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteLogServerService extends ActionService {
  @Inject() action: DeleteLogServerAction

  @Mutation(() => ActionResult)
  deleteLogServer(@Args('input') input: DeleteLogServerInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteLogServerPayload, taskId: string) => {
      const { uuid } = payload
      await this.action.call(
        { uuid },
        {
          actionId,
          taskId
        }
      )
      return {
        id: uuid
      }
    }
    this.actionHelper(input, 'LogServer', actionFn)
    return { actionId }
  }
}
