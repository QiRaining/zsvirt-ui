import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { AddSchedulerJobsToSchedulerJobGroupAction } from '@/api/zstack/AddSchedulerJobsToSchedulerJobGroupAction'
import { CreateSchedulerJobAction } from '@/api/zstack/CreateSchedulerJobAction'
import { DeleteSchedulerJobAction } from '@/api/zstack/DeleteSchedulerJobAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { SchedulerJobType } from '@/zsphere-administration/scheduler-job/scheduler-job.model'

@InputType()
class AddVmToSnapshotStrategyPayload {
  @Field(() => [String])
  rootVolumeUuids: string[]

  @Field(() => Int)
  snapshotGroupMaxNumber: number

  @Field(() => String)
  schedulerJobGroupUuid: string
}

@InputType()
class AddVmToSnapshotStrategyInput {
  @Field(() => AddVmToSnapshotStrategyPayload)
  payload: AddVmToSnapshotStrategyPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddVmToSnapshotStrategyService extends ActionService {
  @Inject()
  createSchedulerJobAction: CreateSchedulerJobAction
  @Inject()
  addSchedulerJobsToSchedulerJobGroupAction: AddSchedulerJobsToSchedulerJobGroupAction
  @Inject()
  deleteSchedulerJobAction: DeleteSchedulerJobAction

  @Mutation(() => ActionResult)
  addVmToSnapshotStrategy(@Args('input') input: AddVmToSnapshotStrategyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (
        {
          schedulerJobGroupUuid,
          snapshotGroupMaxNumber,
          rootVolumeUuids
        }: AddVmToSnapshotStrategyPayload,
        taskId: string
      ) => {
        const jobs = await Promise.allSettled(
          rootVolumeUuids.map(targetResourceUuid =>
            this.createSchedulerJobAction.call(
              {
                name: schedulerJobGroupUuid,
                targetResourceUuid,
                type: SchedulerJobType.volumeSnapshotGroup,
                parameters: { snapshotGroupMaxNumber }
              },
              { actionId, taskId }
            )
          )
        )
        const schedulerJobUuids = jobs.reduce((result, job) => {
          if (job.status === 'fulfilled') {
            result.push(job.value.inventory?.uuid)
          }
          return result
        }, [] as string[])
        if (schedulerJobUuids.length) {
          try {
            await this.addSchedulerJobsToSchedulerJobGroupAction.call(
              { schedulerJobGroupUuid, schedulerJobUuids },
              { actionId, taskId }
            )
          } catch (error) {
            Promise.allSettled(
              schedulerJobUuids.map(uuid => this.deleteSchedulerJobAction.call({ uuid }))
            )
            throw error
          }
        }
        jobs.forEach(job => {
          if (job.status === 'rejected') {
            throw job.reason
          }
        })
        return { id: schedulerJobUuids[0] }
      }
    )
    return { actionId }
  }
}
