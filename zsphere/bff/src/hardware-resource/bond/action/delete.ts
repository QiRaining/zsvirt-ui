import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteBondingAction } from '@/api/zstack/DeleteBondingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteBondPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteBondInput {
  @Field(() => [DeleteBondPayload])
  payload: DeleteBondPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteBondService extends ActionService {
  @Inject() deleteAction: DeleteBondingAction

  @Mutation(() => ActionResult)
  deleteBond(@Args('input') input: DeleteBondInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Bond', async (payload: DeleteBondPayload, taskId: string) => {
      await this.deleteAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload?.uuid
      }
    })
    return { actionId }
  }
}
