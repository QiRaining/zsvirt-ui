import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteSchedulerJobAction } from '@/api/zstack/DeleteSchedulerJobAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteSchedulerJobPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteSchedulerJobInput {
  @Field(() => [DeleteSchedulerJobPayload])
  payload: DeleteSchedulerJobPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteSchedulerJobService extends ActionService {
  @Inject() deleteSchedulerJobAction: DeleteSchedulerJobAction

  @Mutation(() => ActionResult)
  deleteSchedulerJob(@Args('input') input: DeleteSchedulerJobInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerJob',
      async (payload: DeleteSchedulerJobPayload, taskId: string) => {
        await this.deleteSchedulerJobAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
