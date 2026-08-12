import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddLdapServerAction, AddLdapServerActionParam } from '@/api/zstack/AddLdapServerAction'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { UpdateGlobalConfigAction } from '@/api/zstack/UpdateGlobalConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddThirdPartyAuthPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String)
  url: string

  @Field(() => String)
  base: string

  @Field(() => String)
  username: string

  @Field(() => String)
  password: string

  @Field(() => String)
  encryption: string

  @Field(() => String)
  serverType: string

  @Field(() => String)
  usernameProperty: string

  @Field(() => String, { nullable: true })
  filter?: string

  @Field(() => String, { nullable: true, defaultValue: 'CreateAccount' })
  syncCreatedAccountStrategy?: string

  @Field(() => String, { nullable: true, defaultValue: 'NoAction' })
  syncDeletedAccountStrategy?: string

  @Field(() => [String], { nullable: true })
  systemTags: string[]

  @Field(() => [String], { nullable: true })
  tagList: string[]
}

@InputType()
class AddThirdPartyAuthInput {
  @Field(() => AddThirdPartyAuthPayload)
  payload: AddThirdPartyAuthPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddThirdPartyAuthService extends ActionService {
  @Inject() addLdapServerAction: AddLdapServerAction
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() updateGlobalConfigAction: UpdateGlobalConfigAction

  @Mutation(() => ActionResult)
  addThirdPartyAuth(@Args('input') input: AddThirdPartyAuthInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ThirdPartyAuthVO',
      async (payload: AddThirdPartyAuthPayload, taskId: string) => {
        const { tagList = [], ...addLdapServerActionParam } = payload

        const resp = await this.addLdapServerAction.call(
          {
            ...(addLdapServerActionParam as AddLdapServerActionParam)
          },
          { actionId, taskId }
        )

        const uuid = resp?.inventory?.uuid

        const task = [
          this.updateGlobalConfigAction.call({
            category: 'ldap',
            name: 'current.ldap.server.uuid',
            value: uuid
          })
        ]
        let p = null
        tagList.forEach(tag => {
          p = this.createSystemTagAction.call(
            {
              resourceType: 'LdapServerVO',
              resourceUuid: uuid,
              tag
            },
            { actionId, taskId }
          )
          task.push(p)
        })

        await Promise.all(task)
        return {
          id: actionId,
          inventory: resp?.inventory
        }
      }
    )
    return { actionId }
  }
}
