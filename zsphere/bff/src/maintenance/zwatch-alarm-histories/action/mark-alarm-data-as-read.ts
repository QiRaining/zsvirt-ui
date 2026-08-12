import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, ObjectType } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { ActionInfo } from '@/api/zstack/base/types'
import { QueryAlarmRecordAction } from '@/api/zstack/QueryAlarmRecordAction'
import { UpdateAlarmDataAction } from '@/api/zstack/UpdateAlarmDataAction'
import { ActionService } from '@/base/action-service'

@InputType()
class UpdateAlarmDataPayload {
  @Field(() => String)
  dataUuid: string

  @Field(() => String, { nullable: true, defaultValue: 'OnlyOne' })
  updateMode: string

  @Field(() => String, { nullable: true, defaultValue: 'Read' })
  readStatus?: string
}

@ObjectType()
class UpdateAlarmDataResp {
  @Field(() => Boolean, { nullable: true })
  success: boolean
}

@InputType()
class UpdateAlarmDataInput {
  @Field(() => [UpdateAlarmDataPayload])
  payload: UpdateAlarmDataPayload[]
}

export const ALARM_KEYS = ['alarmUuid', 'resourceUuid']

/**
 * 同时调用UpdateAlarmData
 *
 */
export class UpdateAlarmDataAsReadService extends ActionService {
  @Inject() updateAlarmDataAction: UpdateAlarmDataAction
  @Inject() queryAlarmRecordAction: QueryAlarmRecordAction

  @Mutation(() => UpdateAlarmDataResp)
  async updateAlarmDataAsRead(@Args('input') input: UpdateAlarmDataInput) {
    const { dataUuid } = input?.payload?.[0]

    await this.markRead({
      dataUuid,
      keys: ALARM_KEYS,
      queryFn: this.queryAlarmRecordAction,
      readFn: this.updateAlarmDataAction
    })

    return { success: true }
  }

  async markRead({ dataUuid, keys, queryFn, readFn }, info?: ActionInfo) {
    await readFn.call(
      {
        dataUuid,
        updateMode: 'OnlyOne',
        readStatus: 'Read'
      },
      info
    )

    const alarmData = await queryFn.call({
      conditions: [
        {
          key: 'dataUuid',
          value: dataUuid
        }
      ]
    })

    const data = alarmData?.inventories?.[0]

    const conditions = keys
      .map(key => ({
        key,
        op: Op.eq,
        value: data?.[key]
      }))
      .filter(({ value }) => value)
      .concat([
        {
          key: 'readStatus',
          op: Op.eq,
          value: false
        },
        {
          key: 'dataUuid',
          op: Op.ne,
          value: dataUuid
        }
      ])

    const { inventories = [] } = await queryFn.call({
      conditions,
      sortBy: 'createTime',
      sortDirection: 'desc' as const
    })

    const payloadList = inventories.map(cv => ({
      dataUuid: cv.dataUuid,
      updateMode: 'OnlyOne',
      readStatus: 'Read'
    }))

    await Promise.all(
      payloadList.map(payload => {
        readFn.call(payload)
      })
    )
  }
}
