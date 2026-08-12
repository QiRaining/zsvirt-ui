import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { AddSchedulerJobGroupToSchedulerTriggerAction } from '@/api/zstack/AddSchedulerJobGroupToSchedulerTriggerAction'
import { AddSchedulerJobsToSchedulerJobGroupAction } from '@/api/zstack/AddSchedulerJobsToSchedulerJobGroupAction'
import { CreateSchedulerJobAction } from '@/api/zstack/CreateSchedulerJobAction'
import { CreateSchedulerJobGroupAction } from '@/api/zstack/CreateSchedulerJobGroupAction'
import { CreateSchedulerTriggerAction } from '@/api/zstack/CreateSchedulerTriggerAction'
import { DeleteSchedulerJobAction } from '@/api/zstack/DeleteSchedulerJobAction'
import { DeleteSchedulerJobGroupAction } from '@/api/zstack/DeleteSchedulerJobGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { SchedulerJobType } from '@/zsphere-administration/scheduler-job/scheduler-job.model'
import { SchedulerType } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.model'

@InputType()
class CreateSnapshotStrategyPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  rootVolumeUuids?: string[]

  @Field(() => Int)
  snapshotGroupMaxNumber: number

  @Field(() => String)
  cron: string

  @Field(() => Int)
  startTime: number

  @Field(() => Int, { nullable: true })
  endTime?: number
}

@InputType()
class CreateSnapshotStrategyInput {
  @Field(() => CreateSnapshotStrategyPayload)
  payload: CreateSnapshotStrategyPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateSnapshotStrategyService extends ActionService {
  @Inject()
  createSchedulerJobAction: CreateSchedulerJobAction
  @Inject()
  createSchedulerJobGroupAction: CreateSchedulerJobGroupAction
  @Inject()
  addSchedulerJobsToSchedulerJobGroupAction: AddSchedulerJobsToSchedulerJobGroupAction
  @Inject()
  createSchedulerTriggerAction: CreateSchedulerTriggerAction
  @Inject()
  addSchedulerJobGroupToSchedulerTriggerAction: AddSchedulerJobGroupToSchedulerTriggerAction
  @Inject()
  deleteSchedulerJobGroupAction: DeleteSchedulerJobGroupAction
  @Inject()
  deleteSchedulerJobAction: DeleteSchedulerJobAction

  @Mutation(() => ActionResult)
  createSnapshotStrategy(@Args('input') input: CreateSnapshotStrategyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnapshotStrategy',
      async (
        {
          name,
          description,
          rootVolumeUuids,
          snapshotGroupMaxNumber,
          cron,
          endTime: stopTime,
          startTime
        }: CreateSnapshotStrategyPayload,
        taskId: string
      ) => {
        // SchedulerJobGroup
        const group = await this.createSchedulerJobGroupAction.call(
          {
            name,
            description,
            type: SchedulerJobType.volumeSnapshotGroup,
            parameters: { snapshotGroupMaxNumber }
          },
          { actionId, taskId }
        )
        const schedulerJobGroupUuid = group.inventory?.uuid

        // SchedulerJob
        let attachVmJobs: PromiseSettledResult<any>[] = []
        if (rootVolumeUuids?.length) {
          attachVmJobs = await Promise.allSettled(
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
          const schedulerJobUuids = attachVmJobs.reduce((result, job) => {
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
              attachVmJobs.push({ status: 'rejected', reason: error })
            }
          }
        }

        // SchedulerTrigger
        try {
          const trigger = await this.createSchedulerTriggerAction.call(
            {
              name: schedulerJobGroupUuid,
              cron,
              schedulerType: SchedulerType.cron,
              startTime,
              stopTime
            },
            { actionId, taskId }
          )
          const schedulerTriggerUuid = trigger.inventory?.uuid
          await this.addSchedulerJobGroupToSchedulerTriggerAction.call(
            {
              schedulerJobGroupUuid,
              schedulerTriggerUuid
            },
            { actionId, taskId }
          )
        } catch (error) {
          this.deleteSchedulerJobGroupAction.call({ uuid: schedulerJobGroupUuid }).catch(() => {
            // ignore
          })
          throw error
        }

        // SchedulerJob error
        attachVmJobs.forEach(job => {
          if (job.status === 'rejected') {
            throw job.reason
          }
        })

        return { id: schedulerJobGroupUuid }
      }
    )
    return { actionId }
  }
}
