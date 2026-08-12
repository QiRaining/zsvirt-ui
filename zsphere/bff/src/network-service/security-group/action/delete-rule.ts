import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteSecurityGroupRuleAction } from '@/api/zstack/DeleteSecurityGroupRuleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteSecurityGroupRulePayload {
  @Field(() => [String])
  ruleUuids: string[]
}

@InputType()
class DeleteSecurityGroupRuleInput {
  @Field(() => [DeleteSecurityGroupRulePayload])
  payload: DeleteSecurityGroupRulePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteSecurityGroupRuleService extends ActionService {
  @Inject()
  action: DeleteSecurityGroupRuleAction

  @Mutation(() => ActionResult)
  deleteSecurityGroupRule(@Args('input') input: DeleteSecurityGroupRuleInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteSecurityGroupRulePayload, taskId: string) => {
      await this.action.call(payload, {
        actionId,
        taskId
      })
      return {
        id: actionId
      }
    }

    this.actionHelper(input, 'securityGroupRuleList', actionFn)
    return { actionId }
  }
}
