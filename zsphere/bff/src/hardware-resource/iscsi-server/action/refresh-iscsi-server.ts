import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RefreshIscsiServerAction } from '@/api/zstack/RefreshIscsiServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RefreshIscsiServerPayload {
  @Field(() => String, { description: 'iSCSI服务器的的UUID' })
  uuid: string
}

@InputType()
class RefreshIscsiServerInput {
  @Field(() => [RefreshIscsiServerPayload])
  payload: RefreshIscsiServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RefreshIscsiServerService extends ActionService {
  @Inject() refreshIscsiServerAction: RefreshIscsiServerAction

  @Mutation(() => ActionResult)
  refreshIscsiServers(
    @Args('input')
    input: RefreshIscsiServerInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'IscsiServer',
      async ({ uuid, ...rest }: RefreshIscsiServerPayload, taskId: string) => {
        await this.refreshIscsiServerAction.call(
          {
            uuid,
            ...rest
          },
          { actionId, taskId }
        )

        return {
          id: uuid
        }
      }
    )

    return { actionId }
  }
}
