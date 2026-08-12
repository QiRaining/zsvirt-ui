import { Injectable, Inject } from '@nestjs/common'
import { InputType, Field, Args, Mutation, Float, Int } from '@nestjs/graphql'
import { reduce as _reduce } from 'lodash'

import { ActionService } from '@/base/action-service'
import { parallel, serial } from '@/common/flow/flow-instance/flow-instance-chain'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { genUuid } from '@/utils'
import {
  Parameters,
  SchedulerJobType
} from '@/zsphere-administration/scheduler-job/scheduler-job.model'
import { SchedulerType } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.model'

import { AddSchedulerFullJobsToSchedulerFullJobGroupTaskService } from './add-scheduler-full-jobs-to-scheduler-full-job-group-task.service'
import { AddSchedulerJobGroupToSchedulerFullTriggerTaskService } from './add-scheduler-job-group-to-scheduler-full-trigger-task.service'
import { AddSchedulerJobGroupToSchedulerTriggerTaskService } from './add-scheduler-job-group-to-scheduler-trigger-task.service'
import { AddSchedulerJobsToSchedulerJobGroupTaskService } from './add-scheduler-jobs-to-scheduler-job-group-task.service'
import { CreateResourceBackupJobActionHandlerService } from './create-resource-backup-job-action-handler.service'
import { CreateResourceBackupJobTaskHandlerService } from './create-resource-backup-job-task-handler.service'
import { CreateSchedulerFullJobTaskService } from './create-scheduler-full-job-task.service'
import { CreateSchedulerFullTriggerTaskService } from './create-scheduler-full-trigger-task.service'
import { CreateSchedulerJobGroupTaskService } from './create-scheduler-job-group-task.service'
import { CreateSchedulerJobTaskService } from './create-scheduler-job-task.service'
import { CreateSchedulerTriggerTaskService } from './create-scheduler-trigger-task.service'
import { UpdateSchedulerJobGroupTaskService } from './update-scheduler-job-group-task.service'

/*
 * 1, 创建定时器
 * 2, 创建定时任务
 * 3, 创建定时任务组
 * 4, 加载定时任务到定时任务组
 * 5, 加载定时任务组到定时器
 *
 * @date 2020-11-07
 */

@InputType()
export abstract class ResourceSchedulerTrigger {
  @Field(() => Float, { nullable: true }) // 周期，类型为simple的时候才有，一般每小时、每分钟类型的定时器用simple类型
  schedulerInterval?: number

  @Field(() => Float, { nullable: true })
  repeatCount?: number

  @Field(() => Float, { nullable: true }) // 开始时间
  startTime?: number

  @Field(() => SchedulerType) // simple/cron
  schedulerType: SchedulerType

  @Field(() => String, { nullable: true })
  cron?: string
}

@InputType()
export class Priority {
  @Field(() => String)
  rootVolumeUuid: string

  @Field(() => Int, { nullable: true })
  priority?: number
}

@InputType()
class CreateResourceBackupJobPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Parameters, { nullable: true })
  parameters: Parameters

  @Field(() => SchedulerJobType)
  type: SchedulerJobType

  @Field(() => [ResourceSchedulerTrigger])
  triggerList: ResourceSchedulerTrigger[]

  @Field(() => [ResourceSchedulerTrigger], { nullable: true, defaultValue: [] })
  fullTriggerList?: ResourceSchedulerTrigger[]

  @Field(() => [String])
  targetResourceUuids: string[]

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  triggerNow?: boolean

  @Field(() => [Priority], { nullable: true, defaultValue: [] })
  priorities?: Priority[]
}

@InputType()
class CreateResourceBackupJobInput {
  @Field(() => CreateResourceBackupJobPayload)
  payload: CreateResourceBackupJobPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@Injectable()
export class CreateResourceBackupJobService extends ActionService {
  @Inject()
  private createSchedulerTriggerTaskService: CreateSchedulerTriggerTaskService
  @Inject()
  private createSchedulerFullTriggerTaskService: CreateSchedulerFullTriggerTaskService
  @Inject()
  private createSchedulerJobTaskService: CreateSchedulerJobTaskService
  @Inject()
  private createSchedulerFullJobTaskService: CreateSchedulerFullJobTaskService
  @Inject()
  private createSchedulerJobGroupTaskService: CreateSchedulerJobGroupTaskService
  @Inject()
  private addSchedulerJobsToSchedulerJobGroupTaskService: AddSchedulerJobsToSchedulerJobGroupTaskService
  @Inject()
  private addSchedulerFullJobsToSchedulerFullJobGroupTaskService: AddSchedulerFullJobsToSchedulerFullJobGroupTaskService
  @Inject()
  private addSchedulerJobGroupToSchedulerTriggerTaskService: AddSchedulerJobGroupToSchedulerTriggerTaskService
  @Inject()
  private addSchedulerJobGroupToSchedulerFullTriggerTaskService: AddSchedulerJobGroupToSchedulerFullTriggerTaskService

  @Inject()
  createResourceBackupJobTaskHandlerService: CreateResourceBackupJobTaskHandlerService
  @Inject()
  createResourceBackupJobActionHandlerService: CreateResourceBackupJobActionHandlerService
  @Inject()
  updateSchedulerJobGroupTaskService: UpdateSchedulerJobGroupTaskService

  @Mutation(() => ActionResult)
  createResourceBackupJob(@Args('input') input: CreateResourceBackupJobInput) {
    const actionId = input.action.actionId

    const {
      schedulerJobGroupParams = [],
      createSchedulerTriggerParams = [],
      createSchedulerJobParams = [],
      fullTriggerParams = []
    } = this.buildVolumeParams(input.payload)

    this.recordActionService.recordActionStart(input.payload, actionId, input.action.name)

    const flow = parallel(
      schedulerJobGroupParams.map(groupParam => {
        const taskId = genUuid()
        const info = {
          actionId: input.action.actionId,
          taskId
        }
        this.recordActionService.recordTaskStart(taskId, actionId)
        return serial(
          [
            // 串行
            {
              service: CreateSchedulerJobGroupTaskService.name, // 创建JobGroup。 root task
              input: { param: groupParam, info }
            },
            serial([
              // 需要等job创建好，所以用的是serial
              fullTriggerParams.length > 0
                ? fullTriggerParams.map(fullTriggerParam => {
                    return serial([
                      {
                        service: CreateSchedulerFullTriggerTaskService.name, // 创建full Trigger (增量备份)
                        input: { param: fullTriggerParam, info }
                      },
                      {
                        service: AddSchedulerJobGroupToSchedulerFullTriggerTaskService.name, // 加载Trigger到JobGroup (增量备份无立即执行)
                        input: { param: null, info }
                      },
                      serial([
                        // 串行。先批量创建 SchedulerJob, 再将所有SchedulerJob加载到JobGroup
                        {
                          service: UpdateSchedulerJobGroupTaskService.name,
                          input: { param: null, info }
                        },
                        parallel([
                          // 并行
                          createSchedulerJobParams.map(schedulerJobParam => {
                            return {
                              service: CreateSchedulerFullJobTaskService.name,
                              input: { param: schedulerJobParam, info }
                            }
                          })
                        ]),
                        {
                          service: AddSchedulerFullJobsToSchedulerFullJobGroupTaskService.name,
                          input: { param: input.payload.priorities, info }
                        }
                      ])
                    ])
                  })
                : serial([
                    // 串行。先批量创建 SchedulerJob, 再将所有SchedulerJob加载到JobGroup
                    parallel([
                      // 并行
                      createSchedulerJobParams.map(schedulerJobParam => {
                        return {
                          service: CreateSchedulerJobTaskService.name,
                          input: { param: schedulerJobParam, info }
                        }
                      })
                    ]),
                    {
                      service: AddSchedulerJobsToSchedulerJobGroupTaskService.name,
                      input: { param: input.payload.priorities, info }
                    }
                  ]),
              createSchedulerTriggerParams.map((triggerParam, index) => {
                return serial([
                  {
                    service: CreateSchedulerTriggerTaskService.name, // 创建Trigger
                    input: { param: triggerParam, info }
                  },
                  {
                    service: AddSchedulerJobGroupToSchedulerTriggerTaskService.name, // 加载Trigger到JobGroup
                    input: {
                      param: {
                        triggerNow: input.payload.triggerNow && index === 0 ? true : null
                      },
                      info
                    }
                  }
                ])
              })
            ])
          ],
          { info }
        )
      }),
      {
        onSubTaskFinished: CreateResourceBackupJobTaskHandlerService.name,
        onAllFinished: CreateResourceBackupJobActionHandlerService.name
      }
    )

    this.flowManagerService.initServices({
      [CreateSchedulerTriggerTaskService.name]: this.createSchedulerTriggerTaskService,
      [CreateSchedulerFullTriggerTaskService.name]: this.createSchedulerFullTriggerTaskService,
      [CreateSchedulerJobTaskService.name]: this.createSchedulerJobTaskService,
      [CreateSchedulerFullJobTaskService.name]: this.createSchedulerFullJobTaskService,
      [CreateSchedulerJobGroupTaskService.name]: this.createSchedulerJobGroupTaskService,
      [AddSchedulerJobsToSchedulerJobGroupTaskService.name]:
        this.addSchedulerJobsToSchedulerJobGroupTaskService,
      [AddSchedulerFullJobsToSchedulerFullJobGroupTaskService.name]:
        this.addSchedulerFullJobsToSchedulerFullJobGroupTaskService,
      [AddSchedulerJobGroupToSchedulerTriggerTaskService.name]:
        this.addSchedulerJobGroupToSchedulerTriggerTaskService,
      [AddSchedulerJobGroupToSchedulerFullTriggerTaskService.name]:
        this.addSchedulerJobGroupToSchedulerFullTriggerTaskService,
      [CreateResourceBackupJobTaskHandlerService.name]:
        this.createResourceBackupJobTaskHandlerService,
      [UpdateSchedulerJobGroupTaskService.name]: this.updateSchedulerJobGroupTaskService,
      [CreateResourceBackupJobActionHandlerService.name]:
        this.createResourceBackupJobActionHandlerService
    })

    this.flowManagerService.run(flow, actionId, { allowAbort: true }).catch(error => {
      this.recordActionService.recordActionFailed(actionId)
      console.log(error)
    })

    return { actionId }
  }

  buildVolumeParams(actionParam: CreateResourceBackupJobPayload): {
    schedulerJobGroupParams: CreateSchedulerJobGroupTaskParam[]
    createSchedulerTriggerParams: CreateSchedulerTriggerTaskParam[]
    createSchedulerJobParams: CreateSchedulerJobTaskParam[]
    fullTriggerParams: CreateSchedulerTriggerTaskParam[]
  } {
    const schedulerJobGroupParams: CreateSchedulerJobGroupTaskParam[] = [
      {
        name: actionParam.name,
        description: actionParam.description,
        type: actionParam.type,
        parameters: actionParam.parameters || undefined
      }
    ]

    const fullTriggerParams: CreateSchedulerTriggerTaskParam[] = _reduce(
      actionParam.fullTriggerList,
      (arr, item) => {
        const param: CreateSchedulerTriggerTaskParam = {
          name: actionParam.name,
          description: actionParam.description || undefined,
          ...item
        }
        arr.push(param)
        return arr
      },
      []
    )

    const createSchedulerTriggerParams: CreateSchedulerTriggerTaskParam[] = _reduce(
      actionParam.triggerList,
      (arr, item) => {
        const param: CreateSchedulerTriggerTaskParam = {
          name: actionParam.name,
          description: actionParam.description || undefined,
          ...item
        }
        arr.push(param)
        return arr
      },
      []
    )

    const createSchedulerJobParams: CreateSchedulerJobTaskParam[] = _reduce(
      actionParam.targetResourceUuids,
      (arr, targetResourceUuid) => {
        const param: CreateSchedulerJobTaskParam = {
          name: actionParam.name,
          description: actionParam.description || undefined,
          targetResourceUuid: targetResourceUuid,
          type: actionParam.type,
          parameters: actionParam.parameters
        }
        arr.push(param)
        return arr
      },
      []
    )

    return {
      schedulerJobGroupParams,
      createSchedulerTriggerParams,
      createSchedulerJobParams,
      fullTriggerParams
    }
  }
}

export interface CreateSchedulerJobGroupTaskParam {
  name: string
  description?: string
  type: SchedulerJobType
  parameters?: Parameters
}

export interface CreateSchedulerTriggerTaskParam {
  name: string
  description?: string
  schedulerInterval?: number
  repeatCount?: number
  startTime?: number
  schedulerType: SchedulerType
  cron?: string
}

export interface CreateSchedulerJobTaskParam {
  name: string
  description?: string
  targetResourceUuid: string
  type: SchedulerJobType
  parameters?: Parameters
}
