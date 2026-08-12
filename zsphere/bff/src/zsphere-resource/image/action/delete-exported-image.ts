import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteExportedImageFromBackupStorageAction } from '@/api/zstack/DeleteExportedImageFromBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteExportedImagePayload {
  @Field(() => String)
  imageUuid: string

  @Field(() => String)
  backupStorageUuid: string
}

@InputType()
class DeleteExportedImageInput {
  @Field(() => [DeleteExportedImagePayload])
  payload: DeleteExportedImagePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteExportedImageService extends ActionService {
  @Inject()
  deleteExportedImageFromBackupStorageAction: DeleteExportedImageFromBackupStorageAction

  @Mutation(() => ActionResult)
  deleteExportedImage(@Args('input') input: DeleteExportedImageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Image',
      async (payload: DeleteExportedImagePayload, taskId: string) => {
        const { imageUuid, backupStorageUuid } = payload
        await this.deleteExportedImageFromBackupStorageAction.call(
          {
            imageUuid,
            backupStorageUuid
          },
          { actionId, taskId }
        )
        return {
          id: payload.imageUuid
        }
      }
    )
    return { actionId }
  }
}
