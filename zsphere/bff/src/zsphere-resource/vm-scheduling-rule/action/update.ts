import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  UpdateVmSchedulingRuleAction,
  UpdateVmSchedulingRuleResult
} from '@/api/zstack/UpdateVmSchedulingRuleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateVmSchedulingRulePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  mode?: string
}

@InputType()
export class UpdateVmSchedulingRuleInput {
  @Field(() => UpdateVmSchedulingRulePayload)
  payload: UpdateVmSchedulingRulePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVmSchedulingRuleService extends ActionService {
  @Inject() updateVmSchedulingRuleAction: UpdateVmSchedulingRuleAction

  @Mutation(() => ActionResult)
  updateVmSchedulingRule(@Args('input') input: UpdateVmSchedulingRuleInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmSchedulingRule',
      async (payload: UpdateVmSchedulingRulePayload, taskId: string) => {
        const result: UpdateVmSchedulingRuleResult = await this.updateVmSchedulingRuleAction.call(
          { ...payload },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'name,description,mode,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
