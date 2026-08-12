import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'
import { isNil, difference } from 'lodash'

import { AddSchedulerJobGroupToSchedulerTriggerAction } from '@/api/zstack/AddSchedulerJobGroupToSchedulerTriggerAction'
import { AddSchedulerJobsToSchedulerJobGroupAction } from '@/api/zstack/AddSchedulerJobsToSchedulerJobGroupAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateSchedulerJobAction } from '@/api/zstack/CreateSchedulerJobAction'
import { CreateSchedulerTriggerAction } from '@/api/zstack/CreateSchedulerTriggerAction'
import { DeleteSchedulerJobAction } from '@/api/zstack/DeleteSchedulerJobAction'
import { UpdateSchedulerJobAction } from '@/api/zstack/UpdateSchedulerJobAction'
import { UpdateSchedulerJobGroupAction } from '@/api/zstack/UpdateSchedulerJobGroupAction'
import { UpdateSchedulerTriggerAction } from '@/api/zstack/UpdateSchedulerTriggerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql'
import {
  SchedulerJobState,
  SchedulerJobType
} from '@/zsphere-administration/scheduler-job/scheduler-job.model'
import { SchedulerType } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.model'

import { SnapshotStrategyJob } from '../snapshot-strategy.model'

@InputType()
class UpdateSnapshotStrategyPayload {
  @Field(() => String)
  schedulerJobGroupUuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SchedulerJobState, { nullable: true })
  state?: SchedulerJobState

  @Field(() => [String], { nullable: true })
  rootVolumeUuids?: string[]

  @Field(() => [String], { nullable: true })
  removeJobUuids?: string[]

  @Field(() => Int, { nullable: true })
  snapshotGroupMaxNumber?: number

  @Field(() => Boolean, { nullable: true })
  shouldUpdateSnapshotGroupMaxNumber?: boolean

  @Field(() => String, { nullable: true })
  triggerUuid?: string

  @Field(() => String, { nullable: true })
  cron?: string

  @Field(() => Int, { nullable: true })
  startTime?: number

  @Field(() => Int, { nullable: true })
  endTime?: number
}

@InputType()
class UpdateSnapshotStrategyInput {
  @Field(() => [UpdateSnapshotStrategyPayload])
  payload: UpdateSnapshotStrategyPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSnapshotStrategyService extends ActionService {
  @Inject()
  createSchedulerJobAction: CreateSchedulerJobAction
  @Inject()
  createSchedulerTriggerAction: CreateSchedulerTriggerAction
  @Inject()
  updateSchedulerJobAction: UpdateSchedulerJobAction
  @Inject()
  deleteSchedulerJobAction: DeleteSchedulerJobAction
  @Inject()
  updateSchedulerJobGroupAction: UpdateSchedulerJobGroupAction
  @Inject()
  addSchedulerJobsToSchedulerJobGroupAction: AddSchedulerJobsToSchedulerJobGroupAction
  @Inject()
  addSchedulerJobGroupToSchedulerTriggerAction: AddSchedulerJobGroupToSchedulerTriggerAction
  @Inject()
  updateSchedulerTriggerAction: UpdateSchedulerTriggerAction
  @Inject()
  zqlService: ZQLService

  @Mutation(() => ActionResult)
  updateSnapshotStrategy(@Args('input') input: UpdateSnapshotStrategyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnapshotStrategy',
      async (
        {
          schedulerJobGroupUuid,
          name,
          description,
          state,
          rootVolumeUuids,
          removeJobUuids,
          snapshotGroupMaxNumber,
          shouldUpdateSnapshotGroupMaxNumber,
          triggerUuid,
          cron,
          endTime: stopTime,
          startTime
        }: UpdateSnapshotStrategyPayload,
        taskId: string
      ) => {
        // update SchedulerJobGroup
        if (name || !isNil(description) || state || shouldUpdateSnapshotGroupMaxNumber) {
          await this.updateSchedulerJobGroupAction.call(
            {
              uuid: schedulerJobGroupUuid,
              name,
              description,
              state,
              parameters: snapshotGroupMaxNumber ? { snapshotGroupMaxNumber } : undefined
            },
            { actionId, taskId }
          )
        }

        // remove SchedulerJob
        if (removeJobUuids?.length) {
          await Promise.all(
            removeJobUuids.map(uuid =>
              this.deleteSchedulerJobAction.call({ uuid }, { actionId, taskId })
            )
          )
        }

        // update SchedulerJob
        const zql = ZQL.stringify({
          tableName: 'SchedulerJob',
          fields: ['uuid', 'targetResourceUuid'],
          condition: {
            schedulerJobGroupUuids: {
              [ZOp.in]: [schedulerJobGroupUuid]
            },
            state: {
              [ZOp.eq]: SchedulerJobState.Enabled
            }
          }
        })
        let currentJobs: SnapshotStrategyJob[] = []
        try {
          const resp = await this.zqlService.call(zql)
          currentJobs = resp.results?.[0]?.inventories ?? []
        } catch {
          // ignore
        }
        if (currentJobs.length && shouldUpdateSnapshotGroupMaxNumber) {
          await Promise.all(
            currentJobs.map(job =>
              this.updateSchedulerJobAction.call(
                {
                  uuid: job.uuid,
                  parameters: { snapshotGroupMaxNumber }
                },
                { actionId, taskId }
              )
            )
          )
        }

        // create new SchedulerJob
        let attachVmJobs: PromiseSettledResult<any>[] = []
        if (rootVolumeUuids?.length) {
          attachVmJobs = await Promise.allSettled(
            difference(
              rootVolumeUuids,
              currentJobs.map(job => job.targetResourceUuid)
            ).map(targetResourceUuid =>
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

        // create/update SchedulerTrigger
        if (cron || startTime || !isNil(stopTime)) {
          if (triggerUuid) {
            await this.updateSchedulerTriggerAction.call(
              {
                uuid: triggerUuid,
                cron,
                startTime,
                stopTime
              },
              { actionId, taskId }
            )
          } else {
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
          }
        }

        // SchedulerJob error
        attachVmJobs.forEach(job => {
          if (job.status === 'rejected') {
            throw job.reason
          }
        })

        return { id: schedulerJobGroupUuid }
      },
      { bundle: true }
    )
    return { actionId }
  }
}
