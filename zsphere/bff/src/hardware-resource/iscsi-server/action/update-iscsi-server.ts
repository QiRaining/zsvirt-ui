import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateIscsiServerAction } from '@/api/zstack/UpdateIscsiServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateIscsiServerPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true, description: '资源名称' })
  state?: string

  @Field(() => String, { nullable: true, description: '启用状态' })
  name?: string

  @Field(() => String, { nullable: true, description: 'CHAP用户名' })
  chapUserName?: string

  @Field(() => String, { nullable: true, description: 'CHAP密码' })
  chapUserPassword?: string
}

@InputType()
class UpdateIscsiServerInput {
  @Field(() => [UpdateIscsiServerPayload])
  payload: UpdateIscsiServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateIscsiServerService extends ActionService {
  @Inject() updateIscsiServerAction: UpdateIscsiServerAction

  @Mutation(() => ActionResult)
  updateIscsiServers(
    @Args('input')
    input: UpdateIscsiServerInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'IscsiServer',
      async ({ uuid, ...rest }: UpdateIscsiServerPayload, taskId: string) => {
        const result = await this.updateIscsiServerAction.call(
          {
            uuid,
            ...rest
          },
          { actionId, taskId }
        )

        return {
          id: uuid,
          fields: 'state,name,lastOpDate',
          inventory: result.inventory
        }
      }
    )

    return { actionId }
  }
}
