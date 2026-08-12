import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateCasClientAction } from '@/api/zstack/UpdateCasClientAction'
import { UpdateLdapServerAction } from '@/api/zstack/UpdateLdapServerAction'
import { UpdateOAuthClientAction } from '@/api/zstack/UpdateOAuthClientAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateThirdPartyAuthPayload {
  @Field(() => String, { nullable: true })
  ldapServerUuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  url: string

  @Field(() => String, { nullable: true })
  base: string

  @Field(() => String, { nullable: true })
  username: string

  @Field(() => String, { nullable: true })
  password: string

  @Field(() => String, { nullable: true })
  encryption: string

  @Field(() => [String], { nullable: true })
  systemTags: string[]

  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  clientType: string

  @Field(() => String, { nullable: true })
  casServerLoginUrl?: string

  @Field(() => String, { nullable: true })
  casServerUrlPrefix?: string

  @Field(() => [String], { nullable: true })
  tagList: string[]

  @Field(() => String, { nullable: true })
  authorizationUrl?: string

  @Field(() => String, { nullable: true })
  clientId?: string

  @Field(() => String, { nullable: true })
  clientSecret?: string

  @Field(() => String, { nullable: true })
  tokenUrl?: string

  @Field(() => String, { nullable: true })
  usernameProperty?: string

  @Field(() => String, { nullable: true })
  filter?: string

  @Field(() => String, { nullable: true })
  syncCreatedAccountStrategy?: string

  @Field(() => String, { nullable: true })
  syncDeletedAccountStrategy?: string
}

@InputType()
class UpdateThirdPartyAuthInput {
  @Field(() => UpdateThirdPartyAuthPayload)
  payload: UpdateThirdPartyAuthPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateThirdPartyAuthService extends ActionService {
  @Inject() updateLdapServerAction: UpdateLdapServerAction
  @Inject() updateOAuthClientAction: UpdateOAuthClientAction
  @Inject() updateCasClientAction: UpdateCasClientAction

  @Mutation(() => ActionResult)
  updateThirdPartyAuth(@Args('input') input: UpdateThirdPartyAuthInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ThirdPartyAuthVO',
      async (payload: UpdateThirdPartyAuthPayload, taskId: string) => {
        if (payload.clientType === 'CAS') {
          await this.updateCasClientAction.call(
            {
              ...payload
            },
            { actionId, taskId }
          )
          return {
            id: actionId
          }
        }
        if (payload.clientType === 'OAuth2' || payload.clientType === 'OIDC') {
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
        await this.updateLdapServerAction.call(
          {
            ...payload
          },
          { actionId, taskId }
        )
        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
