import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DetachL2NetworkFromHostAction } from '@/api/zstack/DetachL2NetworkFromHostAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DetachL2NetworkFromHostPayload {
  @Field(() => String)
  hostUuid: string

  @Field(() => String)
  l2NetworkUuid: string
}

@InputType()
export class DetachL2NetworkFromHostInput {
  @Field(() => [DetachL2NetworkFromHostPayload])
  payload: DetachL2NetworkFromHostPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachL2NetworkFromHostService extends ActionService {
  @Inject() detachL2NetworkFromHostAction: DetachL2NetworkFromHostAction

  @Mutation(() => ActionResult)
  detachL2NetworkFromHost(@Args('input') input: DetachL2NetworkFromHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Bond',
      async (payload: DetachL2NetworkFromHostPayload, taskId: string) => {
        await this.detachL2NetworkFromHostAction.call(payload, {
          actionId,
          taskId
        })

        return {
          id: payload?.hostUuid
        }
      }
    )
    return { actionId }
  }
}
