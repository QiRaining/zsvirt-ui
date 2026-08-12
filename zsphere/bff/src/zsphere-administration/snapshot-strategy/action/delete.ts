import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteSchedulerJobGroupAction } from '@/api/zstack/DeleteSchedulerJobGroupAction'
import { DeleteSchedulerTriggerAction } from '@/api/zstack/DeleteSchedulerTriggerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteSnapshotStrategyPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  triggerUuid?: string
}

@InputType()
class DeleteSnapshotStrategyInput {
  @Field(() => [DeleteSnapshotStrategyPayload])
  payload: DeleteSnapshotStrategyPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteSnapshotStrategyService extends ActionService {
  @Inject()
  deleteSchedulerJobGroupAction: DeleteSchedulerJobGroupAction
  @Inject()
  deleteSchedulerTriggerAction: DeleteSchedulerTriggerAction

  @Mutation(() => ActionResult)
  deleteSnapshotStrategy(@Args('input') input: DeleteSnapshotStrategyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnapshotStrategy',
      async ({ uuid, triggerUuid }: DeleteSnapshotStrategyPayload, taskId: string) => {
        await this.deleteSchedulerJobGroupAction.call({ uuid }, { actionId, taskId })
        if (triggerUuid) {
          await this.deleteSchedulerTriggerAction.call({ uuid: triggerUuid }, { actionId, taskId })
        }
        return { id: uuid }
      }
    )
    return { actionId }
  }
}
