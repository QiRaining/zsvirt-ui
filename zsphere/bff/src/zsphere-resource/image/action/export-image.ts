import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DoLongjobAction, DoLongjobActionParam } from '@/api/zstack/DoLongjobAction'
import { ExportImageFromBackupStorageAction } from '@/api/zstack/ExportImageFromBackupStorageAction'
import { ExportImageFromBackupStorageActionParam } from '@/api/zstack/ExportImageFromBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ExportImagePayload {
  @Field(() => String)
  imageUuid: string

  @Field(() => String)
  backupStorageUuid: string

  @Field(() => String, { nullable: true })
  type?: string
}

@InputType()
class ExportImageInput {
  @Field(() => [ExportImagePayload])
  payload: ExportImagePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ExportImageService extends ActionService {
  @Inject() doLongjobAction: DoLongjobAction
  @Inject()
  exportImageFromBackupStorageAction: ExportImageFromBackupStorageAction
  @Inject() longJobService: LongJobService

  @Mutation(() => ActionResult)
  exportImage(@Args('input') input: ExportImageInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload, taskId) => {
      const params: ExportImageFromBackupStorageActionParam = {
        imageUuid: payload.imageUuid,
        backupStorageUuid: payload.backupStorageUuid
      }
      const result = await this.exportImageFromBackupStorageAction.call(params, {
        actionId,
        taskId
      })
      return {
        id: payload.imageUuid,
        fields: 'backupStorageRefs{exportUrl}',
        inventory: { backupStorageRefs: { exportUrl: result?.imageUrl } }
      }
      if (payload?.type === 'Ceph') {
        const params: ExportImageFromBackupStorageActionParam = {
          imageUuid: payload.imageUuid,
          backupStorageUuid: payload.backupStorageUuid
        }
        const result = await this.exportImageFromBackupStorageAction.call(params, {
          actionId,
          taskId
        })
        return {
          id: payload.imageUuid,
          imageUrl: result.imageUrl
        }
      }
      const jobData = JSON.stringify(payload)
      this.doLongjobAction.call(
        {
          actionName: input.action.name,
          jobName: 'APIExportImageFromBackupStorageMsg',
          jobData,
          resourceType: 'Image'
        },
        { actionId, taskId }
      )
    })
    return { actionId }
  }
}
