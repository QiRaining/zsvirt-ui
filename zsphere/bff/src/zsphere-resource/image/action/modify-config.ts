import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateImageAction } from '@/api/zstack/UpdateImageAction'
import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ImageBaseUpdate {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  format?: string
}

@InputType()
class ImageChangeBackupStorage {
  @Field(() => String, { nullable: true })
  srcBackupStorageUuid?: string

  @Field(() => String, { nullable: true })
  dstBackupStorageUuid?: string
}

@InputType()
class ImageModidyConfigPayload {
  @Field(() => ImageBaseUpdate)
  baseUpdate: ImageBaseUpdate

  @Field(() => ImageChangeBackupStorage, { nullable: true })
  changeBackupStorage?: ImageChangeBackupStorage
}

@InputType()
class ImageModifyConfigInput {
  @Field(() => ImageModidyConfigPayload)
  payload: ImageModidyConfigPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ImageModifyConfigService extends ActionService {
  @Inject() updateImageAction: UpdateImageAction
  @Inject() longJobService: LongJobService

  @Mutation(() => ActionResult)
  imageModifyConfig(@Args('input') input: ImageModifyConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload: ImageModidyConfigPayload, taskId: string) => {
      const { baseUpdate, changeBackupStorage } = payload
      await this.updateImageAction.call(
        {
          ...baseUpdate
        },
        { actionId, taskId }
      )
      // 更改镜像存储
      if (changeBackupStorage?.dstBackupStorageUuid) {
        const jobData = JSON.stringify({
          ...changeBackupStorage,
          imageUuid: baseUpdate?.uuid
        })
        await this.longJobService.call(
          input.action.name,
          'APIBackupStorageMigrateImageMsg',
          jobData,
          actionId,
          'Image'
        )
      }
      return {
        id: baseUpdate?.uuid,
        fields: `${Object.keys(payload).join(',')},lastOpDate`,
        inventory: { ...baseUpdate }
      }
    })
    return { actionId }
  }
}
