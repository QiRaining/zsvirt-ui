import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeSchedulerStateAction } from '@/api/zstack/ChangeSchedulerStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { SchedulerJobStateEvent } from '../scheduler-job.model'

@InputType()
class ChangeSchedulerJobStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => SchedulerJobStateEvent)
  stateEvent: SchedulerJobStateEvent
}

@InputType()
class ChangeSchedulerJobStateInput {
  @Field(() => [ChangeSchedulerJobStatePayload])
  payload: ChangeSchedulerJobStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeSchedulerJobStateService extends ActionService {
  @Inject() changeSchedulerStateAction: ChangeSchedulerStateAction

  @Mutation(() => ActionResult)
  changeSchedulerJobState(@Args('input') input: ChangeSchedulerJobStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerJob',
      async (payload: ChangeSchedulerJobStatePayload, taskId: string) => {
        await this.changeSchedulerStateAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid,
          fields: 'state',
          inventory: {
            state: payload.stateEvent === 'enable' ? 'Enabled' : 'Disabled'
          }
        }
      }
    )
    return { actionId }
  }
}
