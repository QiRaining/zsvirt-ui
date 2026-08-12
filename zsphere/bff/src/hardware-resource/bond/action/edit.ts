import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateBondingAction } from '@/api/zstack/UpdateBondingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class EditBondPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  description: string
}

@InputType()
export class EditBondInput {
  @Field(() => [EditBondPayload])
  payload: EditBondPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditBondService extends ActionService {
  @Inject() editAction: UpdateBondingAction

  @Mutation(() => ActionResult)
  editBond(@Args('input') input: EditBondInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Bond', async (payload: EditBondPayload, taskId: string) => {
      await this.editAction.call(payload, {
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
