import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateAccessControlRuleAction } from '@/api/zstack/UpdateAccessControlRuleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateAccessControlRulePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  rule?: string
}

@InputType()
class UpdateAccessControlRuleInput {
  @Field(() => UpdateAccessControlRulePayload)
  payload: UpdateAccessControlRulePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateAccessControlRuleService extends ActionService {
  @Inject() updateAccessControlRuleAction: UpdateAccessControlRuleAction

  @Mutation(() => ActionResult)
  updateAccessControlRule(@Args('input') input: UpdateAccessControlRuleInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccessControlRule',
      async (payload: UpdateAccessControlRulePayload, taskId: string) => {
        const { uuid } = payload

        await this.updateAccessControlRuleAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: uuid
        }
      }
    )
    return { actionId }
  }
}
