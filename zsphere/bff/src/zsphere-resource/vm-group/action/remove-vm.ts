import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  DetachVmFromVmSchedulingRuleGroupAction,
  DetachVmFromVmSchedulingRuleGroupResult
} from '@/api/zstack/DetachVmFromVmSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionResult, ActionInput } from '@/common/model/action.model'

@InputType()
export class RemoveVmFromVmGroupPayload {
  @Field(() => String)
  vmGroupUuid: string

  @Field(() => String)
  vmUuid: string
}

@InputType()
export class RemoveVmFromVmGroupInput {
  @Field(() => [RemoveVmFromVmGroupPayload])
  payload: RemoveVmFromVmGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveVmFromVmGroupService extends ActionService {
  @Inject()
  detachVmFromVmSchedulingRuleGroupAction: DetachVmFromVmSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  removeVmFromVmGroup(@Args('input') input: RemoveVmFromVmGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmGroup',
      async (payload: RemoveVmFromVmGroupPayload, taskId: string) => {
        const result: DetachVmFromVmSchedulingRuleGroupResult =
          await this.detachVmFromVmSchedulingRuleGroupAction.call(
            { ...payload },
            { actionId, taskId }
          )
        return {
          id: payload.vmGroupUuid,
          fields: 'vmCount'
        }
      }
    )
    return { actionId }
  }
}
