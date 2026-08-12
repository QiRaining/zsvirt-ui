import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateOAuthClientAction } from '@/api/zstack/UpdateOAuthClientAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateAccountThirdPartyAuthPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  usernameProperty?: string

  @Field(() => String, { nullable: true })
  authorizationUrl?: string

  @Field(() => String, { nullable: true })
  clientId?: string

  @Field(() => String, { nullable: true })
  clientSecret?: string

  @Field(() => String, { nullable: true })
  tokenUrl?: string

  @Field(() => String, { nullable: true })
  userinfoUrl?: string

  @Field(() => String, { nullable: true })
  logoutUrl?: string
}

@InputType()
class UpdateAccountThirdPartyAuthInput {
  @Field(() => UpdateAccountThirdPartyAuthPayload)
  payload: UpdateAccountThirdPartyAuthPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateAccountThirdPartyAuthService extends ActionService {
  @Inject() updateOAuthClientAction: UpdateOAuthClientAction

  @Mutation(() => ActionResult)
  updateAccountThirdPartyAuth(@Args('input') input: UpdateAccountThirdPartyAuthInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccountThirdPartyAuthVO',
      async (payload: UpdateAccountThirdPartyAuthPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: UpdateAccountThirdPartyAuthPayload, taskId: string, actionId: string) {
    await this.updateOAuthClientAction.call(
      {
        ...payload
      },
      { actionId, taskId }
    )
    return {
      id: actionId
    }
  }
}
