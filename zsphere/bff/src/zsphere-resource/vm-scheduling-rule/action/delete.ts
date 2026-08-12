import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RemoveVmSchedulingRuleAction } from '@/api/zstack/RemoveVmSchedulingRuleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteVmSchedulingRulePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteVmSchedulingRuleInput {
  @Field(() => [DeleteVmSchedulingRulePayload])
  payload: DeleteVmSchedulingRulePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVmSchedulingRuleService extends ActionService {
  @Inject() removeVmSchedulingRuleAction: RemoveVmSchedulingRuleAction

  @Mutation(() => ActionResult)
  deleteVmSchedulingRule(@Args('input') input: DeleteVmSchedulingRuleInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmSchedulingRule',
      async (payload: DeleteVmSchedulingRulePayload, taskId: string) => {
        await this.removeVmSchedulingRuleAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
