import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  DetachHostFromHostSchedulingRuleGroupAction,
  DetachHostFromHostSchedulingRuleGroupResult
} from '@/api/zstack/DetachHostFromHostSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionResult, ActionInput } from '@/common/model/action.model'

@InputType()
export class RemoveHostFromHostGroupPayload {
  @Field(() => String)
  hostGroupUuid: string

  @Field(() => String)
  hostUuid: string
}

@InputType()
export class RemoveHostFromHostGroupInput {
  @Field(() => [RemoveHostFromHostGroupPayload])
  payload: RemoveHostFromHostGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveHostFromHostGroupService extends ActionService {
  @Inject()
  detachHostFromHostSchedulingRuleGroupAction: DetachHostFromHostSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  removeHostFromHostGroup(@Args('input') input: RemoveHostFromHostGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostGroup',
      async (payload: RemoveHostFromHostGroupPayload, taskId: string) => {
        console.log('payload===', payload)
        const result: DetachHostFromHostSchedulingRuleGroupResult =
          await this.detachHostFromHostSchedulingRuleGroupAction.call(
            { ...payload },
            { actionId, taskId }
          )
        return {
          id: payload?.[0]?.hostGroupUuid,
          fields: 'hostCount'
          // inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
