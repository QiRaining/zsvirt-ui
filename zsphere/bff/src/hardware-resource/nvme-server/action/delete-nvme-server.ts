import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteNvmeServerAction } from '@/api/zstack/DeleteNvmeServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteNvmeServerPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteNvmeServerInput {
  @Field(() => [DeleteNvmeServerPayload])
  payload: DeleteNvmeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteNvmeServerService extends ActionService {
  @Inject() deleteNvmeServerAction: DeleteNvmeServerAction

  @Mutation(() => ActionResult)
  deleteNvmeServer(@Args('input') input: DeleteNvmeServerInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'NvmeServer',
      async ({ uuid }: DeleteNvmeServerPayload, taskId: string) => {
        await this.deleteNvmeServerAction.call({ uuid }, { actionId, taskId })

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
