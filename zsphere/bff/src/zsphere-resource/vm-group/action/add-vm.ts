import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AddVmToVmSchedulingRuleGroupAction,
  AddVmToVmSchedulingRuleGroupResult
} from '@/api/zstack/AddVmToVmSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AddVmToVmGroupPayload {
  @Field(() => String)
  vmGroupUuid: string

  @Field(() => String)
  vmUuid: string
}

@InputType()
export class AddVmToVmGroupInput {
  @Field(() => [AddVmToVmGroupPayload])
  payload: AddVmToVmGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddVmToVmGroupService extends ActionService {
  @Inject()
  addVmToVmSchedulingRuleGroupAction: AddVmToVmSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  addVmToVmGroup(@Args('input') input: AddVmToVmGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VmGroup', async (payload: AddVmToVmGroupPayload, taskId: string) => {
      const result: AddVmToVmSchedulingRuleGroupResult =
        await this.addVmToVmSchedulingRuleGroupAction.call({ ...payload }, { actionId, taskId })
      return {
        id: payload.vmGroupUuid,
        fields: 'vmCount'
      }
    })
    return { actionId }
  }
}
