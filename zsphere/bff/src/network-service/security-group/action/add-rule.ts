import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { AddSecurityGroupRuleAction } from '@/api/zstack/AddSecurityGroupRuleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { AddRuleParam } from './create'

@InputType()
class AddSecurityGroupRulePayload {
  @Field(() => String)
  securityGroupUuid: string

  @Field(() => [AddRuleParam])
  rules: AddRuleParam[]

  @Field(() => [String], { nullable: true })
  remoteSecurityGroupUuids?: string[]

  @Field(() => Int, { nullable: true })
  priority?: number
}

@InputType()
export class AddSecurityGroupRuleInput {
  @Field(() => AddSecurityGroupRulePayload)
  payload: AddSecurityGroupRulePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddSecurityGroupRuleService extends ActionService {
  @Inject() addSecurityGroupRuleAction: AddSecurityGroupRuleAction

  @Mutation(() => ActionResult)
  addSecurityGroupRule(@Args('input') input: AddSecurityGroupRuleInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AddSecurityGroupRulePayload, taskId: string) => {
      const { inventory } = await this.addSecurityGroupRuleAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: inventory.uuid
      }
    }

    this.actionHelper(input, 'securityGroupRuleList', actionFn)
    return { actionId }
  }
}
