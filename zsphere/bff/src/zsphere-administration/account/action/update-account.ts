import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateAccountAction } from '@/api/zstack/UpdateAccountAction'
import { ActionService } from '@/base/action-service'
import { State as AccountState } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateAccountPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => AccountState, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  oldPassword?: string
}

@InputType()
class UpdateAccountInput {
  @Field(() => [UpdateAccountPayload])
  payload: UpdateAccountPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateAccountService extends ActionService {
  @Inject() updateAccountAction: UpdateAccountAction

  @Mutation(() => ActionResult)
  updateAccount(@Args('input') input: UpdateAccountInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'AccountVO', async (payload: UpdateAccountPayload, taskId: string) => {
      await this.updateAccountAction.call(
        {
          ...payload
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid
      }
    })
    return { actionId }
  }
}
