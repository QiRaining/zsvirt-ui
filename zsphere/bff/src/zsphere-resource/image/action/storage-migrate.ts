import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class BackupStorageMigrateImagePayload {
  @Field(() => String)
  imageUuid: string

  @Field(() => String)
  srcBackupStorageUuid: string

  @Field(() => String)
  dstBackupStorageUuid: string
}

@InputType()
class BackupStorageMigrateImageInput {
  @Field(() => BackupStorageMigrateImagePayload)
  payload: BackupStorageMigrateImagePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class StorageMigrateService extends ActionService {
  @Inject() longJobService: LongJobService

  @Mutation(() => ActionResult)
  backupStorageMigrateImage(@Args('input') input: BackupStorageMigrateImageInput) {
    const actionId = input.action.actionId
    const jobData = JSON.stringify(input.payload)
    this.longJobService.call(
      input.action.name,
      'APIBackupStorageMigrateImageMsg',
      jobData,
      actionId,
      'Image'
    )
    return { actionId }
  }
}
