import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteAccessControlRuleAction } from '@/api/zstack/DeleteAccessControlRuleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteAccessControlRulePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteAccessControlRuleInput {
  @Field(() => [DeleteAccessControlRulePayload])
  payload: DeleteAccessControlRulePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteAccessControlRuleService extends ActionService {
  @Inject() deleteAccessControlRuleAction: DeleteAccessControlRuleAction

  @Mutation(() => ActionResult)
  deleteAccessControlRule(@Args('input') input: DeleteAccessControlRuleInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccessControlRule',
      async (payload: DeleteAccessControlRulePayload, taskId: string) => {
        await this.deleteAccessControlRuleAction.call({ ...payload }, { actionId, taskId })
        return {
          id: input.payload?.[0].uuid
        }
      }
    )
    return { actionId }
  }
}
