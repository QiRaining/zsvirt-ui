import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  SyncImageFromImageStoreBackupStorageAction,
  SyncImageFromImageStoreBackupStorageResult
} from '@/api/zstack/SyncImageFromImageStoreBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SyncImageFromImageStoreBackupStoragePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  srcBackupStorageUuid: string

  @Field(() => String)
  dstBackupStorageUuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class SyncImageFromImageStoreBackupStorageInput {
  @Field(() => [SyncImageFromImageStoreBackupStoragePayload])
  payload: SyncImageFromImageStoreBackupStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SyncImageFromImageStoreBackupStorageService extends ActionService {
  @Inject()
  syncImageFromImageStoreBackupStorageAction: SyncImageFromImageStoreBackupStorageAction

  @Mutation(() => ActionResult)
  syncImageFromImageStoreBackupStorage(
    @Args('input') input: SyncImageFromImageStoreBackupStorageInput
  ) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Image',
      async (payload: SyncImageFromImageStoreBackupStoragePayload, taskId: string) => {
        const result: SyncImageFromImageStoreBackupStorageResult =
          await this.syncImageFromImageStoreBackupStorageAction.call(
            { ...payload },
            { actionId, taskId }
          )
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
