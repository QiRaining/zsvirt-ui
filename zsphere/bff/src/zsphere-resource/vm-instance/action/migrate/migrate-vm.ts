import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DoLongjobAction } from '@/api/zstack/DoLongjobAction'
import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { CancelLongjobHelperService } from '@/zsphere-administration/operation-log/action/cancel-long-job'

@InputType()
class MigrateVmPayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  hostUuid: string

  @Field(() => String, { nullable: true })
  strategy?: string

  @Field(() => [String], { nullable: true })
  backupTaskLongJobUuids?: string[]
}

@InputType()
class MigrateVmInput {
  @Field(() => MigrateVmPayload)
  payload: MigrateVmPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class MigrateVmService extends ActionService {
  @Inject() longJobService: LongJobService
  @Inject() cancelLongjobHelperService: CancelLongjobHelperService
  @Inject() doLongjobAction: DoLongjobAction

  @Mutation(() => ActionResult)
  async migrateVm(@Args('input') input: MigrateVmInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'VmInstance', async (payload: MigrateVmPayload, taskId: string) => {
      const jobData = JSON.stringify(input.payload)

      if (!!input.payload?.backupTaskLongJobUuids?.length) {
        await Promise.all(
          input.payload?.backupTaskLongJobUuids?.map(longjobUuid =>
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
          jobName: 'APIMigrateVmMsg',
          jobData,
          resourceType: 'VmInstance',
          targetResourceUuid: payload.vmInstanceUuid
        },
        { actionId, taskId }
      )

      // await this.longJobService.call(
      //   input.action.name,
      //   'APIMigrateVmMsg',
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
    })

    return { actionId }
  }
}
