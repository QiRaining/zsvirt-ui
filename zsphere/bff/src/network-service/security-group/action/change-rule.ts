import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeSecurityGroupRuleAction } from '@/api/zstack/ChangeSecurityGroupRuleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { AddRuleParam } from './create'

@InputType()
class ChangeSecurityGroupRulePayload extends AddRuleParam {
  @Field(() => String)
  uuid: string
}

@InputType()
export class ChangeSecurityGroupRuleInput {
  @Field(() => ChangeSecurityGroupRulePayload)
  payload: ChangeSecurityGroupRulePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeSecurityGroupRuleService extends ActionService {
  @Inject() changeSecurityGroupRuleAction: ChangeSecurityGroupRuleAction

  @Mutation(() => ActionResult)
  changeSecurityGroupRule(@Args('input') input: ChangeSecurityGroupRuleInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'securityGroupRuleList',
      async (payload: ChangeSecurityGroupRulePayload, taskId: string) => {
        await this.changeSecurityGroupRuleAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
