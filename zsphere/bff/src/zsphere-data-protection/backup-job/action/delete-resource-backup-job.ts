import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { get as _get, map as _map } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { DeleteSchedulerJobAction } from '@/api/zstack/DeleteSchedulerJobAction'
import {
  DeleteSchedulerJobGroupAction,
  DeleteSchedulerJobGroupResult
} from '@/api/zstack/DeleteSchedulerJobGroupAction'
import { DeleteSchedulerTriggerAction } from '@/api/zstack/DeleteSchedulerTriggerAction'
import { QuerySchedulerJobGroupAction } from '@/api/zstack/QuerySchedulerJobGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteResourceBackupJobPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String], { nullable: true, defaultValue: [] })
  triggersUuid?: string[]
}

@InputType()
class DeleteResourceBackupJobInput {
  @Field(() => [DeleteResourceBackupJobPayload])
  payload: DeleteResourceBackupJobPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteResourceBackupJobService extends ActionService {
  @Inject() deleteSchedulerJobGroupAction: DeleteSchedulerJobGroupAction
  @Inject() querySchedulerJobGroupAction: QuerySchedulerJobGroupAction
  @Inject() deleteSchedulerJobAction: DeleteSchedulerJobAction
  @Inject() deleteSchedulerTriggerAction: DeleteSchedulerTriggerAction

  @Mutation(() => ActionResult)
  deleteResourceBackupJob(@Args('input') input: DeleteResourceBackupJobInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerJobGroup',
      async (payload: DeleteResourceBackupJobPayload, taskId: string) => {
        let resp
        try {
          resp = await this.querySchedulerJobGroupAction.call({
            conditions: [
              {
                key: 'uuid',
                op: Op.eq,
                value: payload.uuid
              }
            ]
          })
        } catch (e) {
          console.log(e)
        }
        // const _jobsUuid = _get(resp, ['inventories', '0', 'jobsUuid'], undefined) // 会自动删除相关联job
        const _triggersUuid = _get(resp, ['inventories', '0', 'triggersUuid'], undefined)

        // const jobsUuid = _jobsUuid || payload.jobsUuid || [] // 会自动删除相关联job
        const triggersUuid = _triggersUuid || payload.triggersUuid || []

        // _forEach(jobsUuid, jobUuid => this.deleteSchedulerJobAction.call({ uuid: jobUuid }, { actionId, taskId })) // 会自动删除相关联job

        await Promise.all(
          _map(triggersUuid, triggerUuid =>
            this.deleteSchedulerTriggerAction.call({ uuid: triggerUuid }, { actionId, taskId })
          )
        )

        const result: DeleteSchedulerJobGroupResult = await this.deleteSchedulerJobGroupAction.call(
          { uuid: payload.uuid },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          ...result
        }
      },
      {
        listenerType: 'DeleteSchedulerJobGroup'
      }
    )
    return { actionId }
  }
}
