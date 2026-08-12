import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  UpdateVmSchedulingRuleGroupAction,
  UpdateVmSchedulingRuleGroupResult
} from '@/api/zstack/UpdateVmSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateVmGroupPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
export class UpdateVmGroupInput {
  @Field(() => UpdateVmGroupPayload)
  payload: UpdateVmGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVmGroupService extends ActionService {
  @Inject()
  updateVmSchedulingRuleGroupAction: UpdateVmSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  updateVmGroup(@Args('input') input: UpdateVmGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VmGroup', async (payload: UpdateVmGroupPayload, taskId: string) => {
      const result: UpdateVmSchedulingRuleGroupResult =
        await this.updateVmSchedulingRuleGroupAction.call({ ...payload }, { actionId, taskId })
      return {
        id: payload.uuid,
        fields: 'name,description,lastOpDate',
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
