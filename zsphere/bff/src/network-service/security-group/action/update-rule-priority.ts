import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { UpdateSecurityGroupRulePriorityAction } from '@/api/zstack/UpdateSecurityGroupRulePriorityAction'
import { ActionService } from '@/base/action-service'
import { SecurityGroupRuleType } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SecurityGroupRulePriority {
  @Field(() => String)
  ruleUuid: string

  @Field(() => Int)
  priority: number
}

@InputType()
class UpdateSecurityGroupRulePriorityPayload {
  @Field(() => String)
  securityGroupUuid: string

  @Field(() => SecurityGroupRuleType)
  type: SecurityGroupRuleType

  @Field(() => [SecurityGroupRulePriority], {
    nullable: true,
    defaultValue: []
  })
  rules: SecurityGroupRulePriority[]
}

@InputType()
export class UpdateSecurityGroupRulePriorityInput {
  @Field(() => [UpdateSecurityGroupRulePriorityPayload])
  payload: UpdateSecurityGroupRulePriorityPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSecurityGroupRulePriorityService extends ActionService {
  @Inject()
  updateSecurityGroupRulePriorityAction: UpdateSecurityGroupRulePriorityAction

  @Mutation(() => ActionResult)
  updateSecurityGroupRulePriority(@Args('input') input: UpdateSecurityGroupRulePriorityInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'securityGroupRuleList',
      async (payload: UpdateSecurityGroupRulePriorityPayload, taskId: string) => {
        await this.updateSecurityGroupRulePriorityAction.call(payload, {
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
