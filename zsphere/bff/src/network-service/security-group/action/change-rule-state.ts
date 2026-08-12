import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeSecurityGroupRuleStateAction } from '@/api/zstack/ChangeSecurityGroupRuleStateAction'
import { ActionService } from '@/base/action-service'
import { SecurityGroupRuleState } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeSecurityGroupRuleStatePayload {
  @Field(() => String)
  securityGroupUuid: string

  @Field(() => [String])
  ruleUuids: string[]

  @Field(() => SecurityGroupRuleState)
  state: SecurityGroupRuleState
}

@InputType()
export class ChangeSecurityGroupRuleStateInput {
  @Field(() => [ChangeSecurityGroupRuleStatePayload])
  payload: ChangeSecurityGroupRuleStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeSecurityGroupRuleStateService extends ActionService {
  @Inject()
  changeSecurityGroupRuleStateAction: ChangeSecurityGroupRuleStateAction

  @Mutation(() => ActionResult)
  changeSecurityGroupRuleState(@Args('input') input: ChangeSecurityGroupRuleStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'securityGroupRuleList',
      async (payload: ChangeSecurityGroupRuleStatePayload, taskId: string) => {
        const { inventory } = await this.changeSecurityGroupRuleStateAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: inventory.uuid
        }
      }
    )
    return { actionId }
  }
}
