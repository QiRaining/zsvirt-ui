import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteCephPrimaryStoragePoolAction } from '@/api/zstack/DeleteCephPrimaryStoragePoolAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteCephPrimaryStoragePoolPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteCephPrimaryStoragePoolListInput {
  @Field(() => [DeleteCephPrimaryStoragePoolPayload])
  payload: DeleteCephPrimaryStoragePoolPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteCephPrimaryStoragePoolService extends ActionService {
  @Inject()
  deleteCephPrimaryStoragePoolAction: DeleteCephPrimaryStoragePoolAction

  @Mutation(() => ActionResult)
  deleteCephPrimaryStoragePoolList(@Args('input') input: DeleteCephPrimaryStoragePoolListInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'CephPrimaryStoragePool',
      async (payload: DeleteCephPrimaryStoragePoolPayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteCephPrimaryStoragePoolAction.call({ uuid }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
