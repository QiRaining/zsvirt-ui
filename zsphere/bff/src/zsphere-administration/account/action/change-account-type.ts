import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeAccountTypeAction } from '@/api/zstack/ChangeAccountTypeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeAccountTypePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  type: string
}

@InputType()
class ChangeAccountTypeInput {
  @Field(() => [ChangeAccountTypePayload])
  payload: ChangeAccountTypePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeAccountTypeService extends ActionService {
  @Inject() changeAccountTypeAction: ChangeAccountTypeAction

  @Mutation(() => ActionResult)
  changeAccountType(@Args('input') input: ChangeAccountTypeInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccountVO',
      async (payload: ChangeAccountTypePayload, taskId: string) => {
        await this.changeAccountTypeAction.call(
          {
            ...payload
          },
          { actionId, taskId }
        )
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
