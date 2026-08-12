import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { QueryAlarmRecordAction } from '@/api/zstack/QueryAlarmRecordAction'
import { QueryEventRecordAction } from '@/api/zstack/QueryEventRecordAction'
import { UpdateAlarmDataAction } from '@/api/zstack/UpdateAlarmDataAction'
import { UpdateEventDataAction } from '@/api/zstack/UpdateEventDataAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { UpdateAlarmDataAsReadService, ALARM_KEYS } from './mark-alarm-data-as-read'
import { EVENT_KEYS } from './mark-event-data-as-read'

@InputType()
class UpdateSingleAlarmHistoryAsReadPayload {
  @Field(() => String)
  dataUuid: string

  @Field(() => String)
  type: string
}

@InputType()
class UpdateSingleAlarmHistoryAsReadInput {
  @Field(() => [UpdateSingleAlarmHistoryAsReadPayload])
  payload: UpdateSingleAlarmHistoryAsReadPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSingleAlarmHistoryAsReadService extends ActionService {
  @Inject() private updateEventDataAction: UpdateEventDataAction
  @Inject() private updateAlarmDataAction: UpdateAlarmDataAction
  @Inject() private queryAlarmRecordAction: QueryAlarmRecordAction
  @Inject() private queryEventRecordAction: QueryEventRecordAction
  @Inject() private updateAlarmDataAsReadService: UpdateAlarmDataAsReadService

  @Mutation(() => ActionResult)
  async updateSingleAlarmHistoryAsRead(@Args('input') input: UpdateSingleAlarmHistoryAsReadInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AlarmHistories',
      async (payload: UpdateSingleAlarmHistoryAsReadPayload, taskId: string) => {
        const { dataUuid, type } = payload
        if (type === 'event') {
          await this.updateAlarmDataAsReadService.markRead(
            {
              dataUuid,
              keys: EVENT_KEYS,
              queryFn: this.queryEventRecordAction,
              readFn: this.updateEventDataAction
            },
            { actionId, taskId }
          )
        } else {
          await this.updateAlarmDataAsReadService.markRead(
            {
              dataUuid,
              keys: ALARM_KEYS,
              queryFn: this.queryAlarmRecordAction,
              readFn: this.updateAlarmDataAction
            },
            { actionId, taskId }
          )
        }
        return {
          id: dataUuid
        }
      }
    )
    return { actionId }
  }
}
