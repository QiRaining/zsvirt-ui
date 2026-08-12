import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import { DoLongjobAction } from '@/api/zstack/DoLongjobAction'
import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { CancelLongjobHelperService } from '@/zsphere-administration/operation-log/action/cancel-long-job'

@InputType()
class VolumeMigrationAOInput {
  @Field(() => String)
  volumeUuid: string

  @Field(() => String)
  dstPrimaryStorageUuid: string

  @Field(() => Boolean, { nullable: true })
  withSnapshots?: boolean
}

@InputType()
class StorageMigratePayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  dstHostUuid?: string

  @Field(() => String, { nullable: true })
  dstPrimaryStorageUuid?: string

  @Field(() => Boolean, { nullable: true })
  withDataVolumes?: boolean

  @Field(() => Boolean, { nullable: true })
  withSnapshots?: boolean

  @Field(() => Float, { nullable: true })
  bandwidth?: number

  @Field(() => String, { nullable: true })
  strategy?: string

  @Field(() => [String], { nullable: true, defaultValue: [] })
  systemTags?: string[]

  @Field(() => [VolumeMigrationAOInput], { nullable: true })
  volumeMigrationAOs?: VolumeMigrationAOInput[]

  @Field(() => [String], { nullable: true })
  backupTaskLongJobUuids?: string[]
}

@InputType()
class StorageMigrateVmInstanceInput {
  @Field(() => StorageMigratePayload)
  payload: StorageMigratePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class StorageMigratepVmInstanceService extends ActionService {
  @Inject() longJobService: LongJobService
  @Inject() doLongjobAction: DoLongjobAction
  @Inject() cancelLongjobHelperService: CancelLongjobHelperService

  @Mutation(() => ActionResult)
  async storageMigrateVmInstance(@Args('input') input: StorageMigrateVmInstanceInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: StorageMigratePayload, taskId: string) => {
        const jobData = JSON.stringify(input.payload)
        const { backupTaskLongJobUuids } = input.payload
        if (!!backupTaskLongJobUuids?.length) {
          await Promise.all(
            backupTaskLongJobUuids?.map(longjobUuid =>
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

        await this.doLongjobAction.call(
          {
            actionName: input.action.name,
            jobName: 'APIPrimaryStorageMigrateVmMsg',
            jobData,
            resourceType: 'VmInstance'
          },
          { actionId, taskId }
        )
        // await this.longJobService.call(
        //   input.action.name,
        //   'APIPrimaryStorageMigrateVmMsg',
        //   jobData,
        //   actionId,
        //   'VmInstance'
        // )

        return {
          id: payload.vmInstanceUuid,
          inventory: {
            uuid: payload.vmInstanceUuid
          }
        }
      }
    )

    return { actionId }
  }
}
