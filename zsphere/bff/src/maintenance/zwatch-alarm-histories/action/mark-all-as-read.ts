import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateAlarmDataAction } from '@/api/zstack/UpdateAlarmDataAction'
import { UpdateEventDataAction } from '@/api/zstack/UpdateEventDataAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateAllAlarmHistoriesAsReadPayload {
  @Field(() => String, { nullable: true, defaultValue: 'All' })
  updateMode: 'OnlyOne' | 'InRange' | 'All'

  @Field(() => String, { nullable: true, defaultValue: 'Read' })
  readStatus?: 'Read' | 'Unread'
}

@InputType()
class UpdateAllAlarmHistoriesAsReadInput {
  @Field(() => UpdateAllAlarmHistoriesAsReadPayload, {
    nullable: true,
    defaultValue: {
      updateMode: 'All',
      readStatus: 'Read'
    }
  })
  payload: UpdateAllAlarmHistoriesAsReadPayload

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 同时调用UpdateEventData、UpdateAlarmData
 *
 */
export class UpdateAllAlarmHistoriesAsReadService extends ActionService {
  @Inject() updateEventDataAction: UpdateEventDataAction
  @Inject() updateAlarmDataAction: UpdateAlarmDataAction

  @Mutation(() => ActionResult)
  async updateAllAlarmHistoriesAsRead(@Args('input') input: UpdateAllAlarmHistoriesAsReadInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateAllAlarmHistoriesAsReadPayload, taskId: string) => {
      const callList = []
      callList.push(
        this.updateEventDataAction.call(payload, {
          actionId,
          taskId
        })
      )
      callList.push(
        this.updateAlarmDataAction.call(payload, {
          actionId,
          taskId
        })
      )

      await Promise.all(callList)
      return {
        id: taskId
      }
    }

    this.actionHelper(input, 'AlarmHistories', actionFn)
    return { actionId }
  }
}
