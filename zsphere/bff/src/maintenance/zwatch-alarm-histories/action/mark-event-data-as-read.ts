import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, ObjectType } from '@nestjs/graphql'

import { QueryEventRecordAction } from '@/api/zstack/QueryEventRecordAction'
import { UpdateEventDataAction } from '@/api/zstack/UpdateEventDataAction'
import { ActionService } from '@/base/action-service'

import { UpdateAlarmDataAsReadService } from './mark-alarm-data-as-read'

@InputType()
class UpdateEventDataPayload {
  @Field(() => String)
  dataUuid: string

  @Field(() => String, { nullable: true, defaultValue: 'OnlyOne' })
  updateMode: string

  @Field(() => String, { nullable: true, defaultValue: 'Read' })
  readStatus?: string
}

@ObjectType()
class UpdateEventDataResp {
  @Field(() => Boolean, { nullable: true })
  success: boolean
}

@InputType()
class UpdateEventDataInput {
  @Field(() => [UpdateEventDataPayload])
  payload: UpdateEventDataPayload[]
}

export const EVENT_KEYS = ['resourceId', 'subscriptionUuid']

/**
 * 调用UpdateEventData
 *
 */
export class UpdateEventDataAsReadService extends ActionService {
  @Inject() updateEventDataAction: UpdateEventDataAction
  @Inject() queryEventRecordAction: QueryEventRecordAction
  @Inject() updateAlarmDataAsReadService: UpdateAlarmDataAsReadService

  @Mutation(() => UpdateEventDataResp)
  async updateEventDataAsRead(@Args('input') input: UpdateEventDataInput) {
    const { dataUuid } = input?.payload?.[0]

    await this.updateAlarmDataAsReadService.markRead({
      dataUuid,
      keys: EVENT_KEYS,
      queryFn: this.queryEventRecordAction,
      readFn: this.updateEventDataAction
    })

    return { success: true }
  }
}
