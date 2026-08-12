import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DoLongjobAction } from '@/api/zstack/DoLongjobAction'
import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { CancelLongjobHelperService } from '@/zsphere-administration/operation-log/action/cancel-long-job'

@InputType()
class PrimaryStorageMigrateVolumePayload {
  @Field(() => String)
  volumeUuid: string

  @Field(() => String)
  dstPrimaryStorageUuid: string

  @Field(() => [String], { nullable: true, defaultValue: [] })
  systemTags?: string[]

  @Field(() => [String], { nullable: true })
  backupTaskLongJobUuids?: string[]
}

@InputType()
export class PrimaryStorageMigrateVolumeInput {
  @Field(() => [PrimaryStorageMigrateVolumePayload])
  payload: PrimaryStorageMigrateVolumePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class PrimaryStorageMigrateVolumeService extends ActionService {
  @Inject() longJobService: LongJobService
  @Inject() cancelLongjobHelperService: CancelLongjobHelperService
  @Inject() doLongjobAction: DoLongjobAction

  @Mutation(() => ActionResult)
  primaryStorageMigrateVolume(@Args('input') input: PrimaryStorageMigrateVolumeInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'Volume',
      async (payload: PrimaryStorageMigrateVolumePayload, taskId: string) => {
        const jobData = JSON.stringify(payload)
        if (!!payload?.backupTaskLongJobUuids?.length) {
          await Promise.all(
            payload?.backupTaskLongJobUuids?.map(longjobUuid =>
              this.cancelLongjobHelperService.call(
                {
                  longjobUuid
                },
                {
                  actionId,
                  taskId
                }
              )
            )
          )
        }
        // this.longJobService.call(
        //   input.action.name,
        //   'APIPrimaryStorageMigrateVolumeMsg',
        //   jobData,
        //   actionId,
        //   'Volume'
        // )

        await this.doLongjobAction.call(
          {
            actionName: input.action.name,
            jobName: 'APIPrimaryStorageMigrateVolumeMsg',
            jobData,
            resourceType: 'Volume',
            targetResourceUuid: payload.volumeUuid
          },
          { actionId, taskId }
        )

        return {
          id: payload.volumeUuid,
          inventory: {
            uuid: payload.volumeUuid
          }
        }
      }
    )

    return { actionId }
  }
}
