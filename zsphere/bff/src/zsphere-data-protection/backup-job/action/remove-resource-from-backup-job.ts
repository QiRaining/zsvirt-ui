import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { get as _get, map as _map } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { DeleteSchedulerJobAction } from '@/api/zstack/DeleteSchedulerJobAction'
import { QuerySchedulerJobAction } from '@/api/zstack/QuerySchedulerJobAction'
import { RemoveSchedulerJobsFromSchedulerJobGroupAction } from '@/api/zstack/RemoveSchedulerJobsFromSchedulerJobGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RemoveResourceFromBackupJobPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  resourceUuids?: string[]
}

@InputType()
class RemoveResourceFromBackupJobInput {
  @Field(() => [RemoveResourceFromBackupJobPayload])
  payload: RemoveResourceFromBackupJobPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveResourceFromBackupJobService extends ActionService {
  @Inject() querySchedulerJobAction: QuerySchedulerJobAction
  @Inject()
  removeSchedulerJobsFromSchedulerJobGroupAction: RemoveSchedulerJobsFromSchedulerJobGroupAction
  @Inject() deleteSchedulerJobAction: DeleteSchedulerJobAction

  @Mutation(() => ActionResult)
  removeResourceFromBackupJob(@Args('input') input: RemoveResourceFromBackupJobInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerJobGroup',
      async (payload: RemoveResourceFromBackupJobPayload, taskId: string) => {
        const resp = await this.querySchedulerJobAction.call({
          conditions: [
            {
              key: 'targetResourceUuid',
              op: Op.in,
              values: payload.resourceUuids
            }
          ]
        })

        const jobsUuid = _map(_get(resp, ['inventories'], []), it => it.uuid)

        await this.removeSchedulerJobsFromSchedulerJobGroupAction.call(
          {
            schedulerJobGroupUuid: payload.uuid,
            schedulerJobUuids: jobsUuid
          },
          { actionId, taskId }
        )

        await Promise.all(
          _map(jobsUuid, jobUuid =>
            this.deleteSchedulerJobAction.call({ uuid: jobUuid }, { actionId, taskId })
          )
        )

        return {
          id: payload.uuid
        }
      },
      {
        listenerType: 'UnBindSchedulerJobGroup'
      }
    )
    return { actionId }
  }
}
