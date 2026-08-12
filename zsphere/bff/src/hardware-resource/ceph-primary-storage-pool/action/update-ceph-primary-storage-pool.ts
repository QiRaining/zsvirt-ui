import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  UpdateCephPrimaryStoragePoolAction,
  UpdateCephPrimaryStoragePoolResult
} from '@/api/zstack/UpdateCephPrimaryStoragePoolAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateCephPrimaryStoragePoolPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  aliasName?: string
}

@InputType()
class UpdateCephPrimaryStoragePoolInput {
  @Field(() => UpdateCephPrimaryStoragePoolPayload)
  payload: UpdateCephPrimaryStoragePoolPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateCephPrimaryStoragePoolService extends ActionService {
  @Inject()
  updateCephPrimaryStoragePoolAction: UpdateCephPrimaryStoragePoolAction

  @Mutation(() => ActionResult)
  updateCephPrimaryStoragePool(@Args('input') input: UpdateCephPrimaryStoragePoolInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'CephPrimaryStoragePool',
      async (payload: UpdateCephPrimaryStoragePoolPayload, taskId: string) => {
        const result: UpdateCephPrimaryStoragePoolResult =
          await this.updateCephPrimaryStoragePoolAction.call(
            {
              ...payload
            },
            { actionId, taskId }
          )
        return {
          id: payload.uuid,
          fields: 'aliasName',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
