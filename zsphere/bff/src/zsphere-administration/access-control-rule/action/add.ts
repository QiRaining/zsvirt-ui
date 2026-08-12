import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddAccessControlRuleAction } from '@/api/zstack/AddAccessControlRuleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { AccessControlRuleType } from '../access-control-rule.model'

@InputType()
class AddAccessControlRulePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  rule: string

  @Field(() => AccessControlRuleType)
  controlStrategy: AccessControlRuleType
}

@InputType()
class AddAccessControlRuleInput {
  @Field(() => AddAccessControlRulePayload)
  payload: AddAccessControlRulePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddAccessControlRuleService extends ActionService {
  @Inject() addAccessControlRuleAction: AddAccessControlRuleAction

  @Mutation(() => ActionResult)
  addAccessControlRule(@Args('input') input: AddAccessControlRuleInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccessControlRule',
      async (payload: AddAccessControlRulePayload, taskId: string) => {
        await this.addAccessControlRuleAction.call({ ...payload }, { actionId, taskId })
        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
