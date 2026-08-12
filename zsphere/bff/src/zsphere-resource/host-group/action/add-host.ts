import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AddHostToHostSchedulingRuleGroupAction,
  AddHostToHostSchedulingRuleGroupResult
} from '@/api/zstack/AddHostToHostSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AddHostToHostGroupPayload {
  @Field(() => String)
  hostGroupUuid: string

  @Field(() => String)
  hostUuid: string
}

@InputType()
export class AddHostToHostGroupInput {
  @Field(() => [AddHostToHostGroupPayload])
  payload: AddHostToHostGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddHostToHostGroupService extends ActionService {
  @Inject()
  addHostToHostSchedulingRuleGroupAction: AddHostToHostSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  addHostToHostGroup(@Args('input') input: AddHostToHostGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostGroup',
      async (payload: AddHostToHostGroupPayload, taskId: string) => {
        const result: AddHostToHostSchedulingRuleGroupResult =
          await this.addHostToHostSchedulingRuleGroupAction.call(
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
