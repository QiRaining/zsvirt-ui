import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddLdapServerAction, AddLdapServerActionParam } from '@/api/zstack/AddLdapServerAction'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { GetLdapEntryAction } from '@/api/zstack/GetLdapEntryAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class TestConnectionThirdPartyAuthPayload {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  username: string

  @Field(() => String, { nullable: true })
  url: string

  @Field(() => String, { nullable: true })
  encryption: string

  @Field(() => String, { nullable: true })
  base: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  serverType?: string

  @Field(() => String, { nullable: true })
  usernameProperty?: string

  @Field(() => String, { nullable: true })
  filter?: string

  @Field(() => String, { nullable: true, defaultValue: 'CreateAccount' })
  syncCreatedAccountStrategy?: string

  @Field(() => String, { nullable: true, defaultValue: 'NoAction' })
  syncDeletedAccountStrategy?: string

  @Field(() => String, { nullable: true })
  ldapFilter: string

  @Field(() => [String], { nullable: true })
  systemTags: string[]

  @Field(() => [String], { nullable: true })
  tagList: string[]
}

@InputType()
class TestConnectionThirdPartyAuthInput {
  @Field(() => TestConnectionThirdPartyAuthPayload)
  payload: TestConnectionThirdPartyAuthPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class TestConnectionThirdPartyService extends ActionService {
  @Inject() getLdapEntryAction: GetLdapEntryAction
  @Inject() addLdapServerAction: AddLdapServerAction
  @Inject() createSystemTagAction: CreateSystemTagAction

  @Mutation(() => ActionResult)
  testConnectionThirdParty(@Args('input') input: TestConnectionThirdPartyAuthInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ThirdPartyAuthVO',
      async (payload: TestConnectionThirdPartyAuthPayload, taskId: string) => {
        const { uuid, ldapFilter, tagList, ...parmas } = payload

        try {
          if (uuid) {
            await this.getLdapEntryAction.call(
              {
                ldapServerUuid: uuid,
                ldapFilter
              },
              { actionId, taskId }
            )
          } else {
            await this.addLdapServerAction.call(
              {
                ...(parmas as AddLdapServerActionParam),
                systemTags: ['ephemeral::validationOnly']
              },
              { actionId, taskId }
            )
          }
        } catch (e) {
          throw e
        }
        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
