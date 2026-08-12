import { Injectable, Inject } from '@nestjs/common'
import { Field, ArgsType, Int, Query, ObjectType, Args, Float } from '@nestjs/graphql'
import { sortBy, uniqWith } from 'lodash'

import { GetZWatchAlertHistogramAction } from '@/api/zstack/GetZWatchAlertHistogramAction'

@ArgsType()
class GetAlarmHistogramPayload {
  @Field(() => Int, { description: '统计数据的时间粒度' })
  intervalHours: number

  @Field(() => String, { nullable: true })
  tableName: 'AlarmRecordsVO' | 'EventRecordsVO'

  @Field(() => Float)
  startTime: number

  @Field(() => Float)
  endTime: number

  @Field(() => [String], { nullable: true, defaultValue: ['emergencyLevel'] })
  groupColumns?: string[]
}

@ObjectType()
export class AlertHistogramTag {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  value?: string
}

@ObjectType()
export class AlertHistogram {
  @Field(() => Int, { nullable: true })
  count?: number

  @Field(() => [AlertHistogramTag], { nullable: true })
  tags?: AlertHistogramTag[]

  @Field(() => Float, { nullable: true })
  time?: number

  @Field(() => String, { nullable: true })
  emergencyLevel?: string
}

@ObjectType()
export class QueryAlertHistogramResp {
  @Field(() => [AlertHistogram], { nullable: true })
  list?: AlertHistogram[]
}

@Injectable()
export class GetAlarmHistogramService {
  @Inject() getZWatchAlertHistogramAction: GetZWatchAlertHistogramAction

  @Query(() => QueryAlertHistogramResp)
  async getAlarmHistogram(@Args() args: GetAlarmHistogramPayload) {
    const { histograms: eventList = [] } = await this.getZWatchAlertHistogramAction.call({
      ...args,
      tableName: 'EventRecordsVO'
    })
    const { histograms: alarmList = [] } = await this.getZWatchAlertHistogramAction.call({
      ...args,
      tableName: 'AlarmRecordsVO'
    })

    const list = alarmList.concat(eventList) as AlertHistogram[]

    const formatList = sortBy(this.formatList(list), 'time')
    const finalList = uniqWith(formatList, (a, b) => {
      const isEqual = a.time === b.time && a.emergencyLevel === b.emergencyLevel
      if (isEqual) {
        b.count += a.count
      }
      return isEqual
    })

    return { list: finalList }
  }

  formatList = (list: AlertHistogram[]) =>
    ['Emergent', 'Important', 'Normal'].reduce((acc: any, emergencyLevel) => {
      list.forEach(it => {
        let count = 0
        if (it.tags?.[0]?.value === emergencyLevel) {
          count = it.count
        }
        acc.push({
          count,
          time: it.time,
          emergencyLevel
        })
      })
      return acc
    }, [])
}
