import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteIpRangeAction } from '@/api/zstack/DeleteIpRangeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteIpRangePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteIpRangeInput {
  @Field(() => [DeleteIpRangePayload])
  payload: DeleteIpRangePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteIpRangeService extends ActionService {
  @Inject() deleteIpRangeAction: DeleteIpRangeAction

  @Mutation(() => ActionResult)
  deleteIpRange(@Args('input') input: DeleteIpRangeInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteIpRangePayload, taskId: string) => {
      await this.deleteIpRangeAction.call(payload, {
        actionId,
        taskId
      })

      return {
        id: 'xxx'
      }
    }

    this.actionHelper(input, 'IpRange', actionFn)
    return { actionId }
  }
}
