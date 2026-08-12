import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  UpdateHostSchedulingRuleGroupAction,
  UpdateHostSchedulingRuleGroupResult
} from '@/api/zstack/UpdateHostSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateHostGroupPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class UpdateHostGroupInput {
  @Field(() => UpdateHostGroupPayload)
  payload: UpdateHostGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateHostGroupService extends ActionService {
  @Inject()
  updateHostSchedulingRuleGroupAction: UpdateHostSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  updateHostGroup(@Args('input') input: UpdateHostGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostGroup',
      async (payload: UpdateHostGroupPayload, taskId: string) => {
        const result: UpdateHostSchedulingRuleGroupResult =
          await this.updateHostSchedulingRuleGroupAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid,
          fields: 'name,description,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
