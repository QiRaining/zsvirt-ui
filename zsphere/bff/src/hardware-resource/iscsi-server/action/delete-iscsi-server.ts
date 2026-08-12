import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteIscsiServerAction } from '@/api/zstack/DeleteIscsiServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteIscsiServerPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteIscsiServerInput {
  @Field(() => [DeleteIscsiServerPayload])
  payload: DeleteIscsiServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteIscsiServerService extends ActionService {
  @Inject() deleteIscsiServerAction: DeleteIscsiServerAction

  @Mutation(() => ActionResult)
  deleteIscsiServers(@Args('input') input: DeleteIscsiServerInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'IscsiServer',
      async ({ uuid }: DeleteIscsiServerPayload, taskId: string) => {
        await this.deleteIscsiServerAction.call({ uuid }, { actionId, taskId })

        return {
          id: uuid,
          inventory: {
            actionType: 'delete',
            id: uuid
          }
        }
      }
    )

    return { actionId }
  }
}
