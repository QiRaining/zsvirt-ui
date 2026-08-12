import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import {
  AlarmData,
  AssignResourceAlarmData,
  GetAssignResourceAlarmDataInput
} from '@/maintenance/alarm-data/alarm-data.model'
import { AlarmDataService } from '@/maintenance/alarm-data/alarm-data.service'

@Resolver(() => AlarmData)
export class AlarmDataResolver {
  @Inject() alarmDataService: AlarmDataService

  @Query(() => [AlarmData])
  async alarmData(@Args() queryArgs: IQueryAction) {
    return this.alarmDataService.get(queryArgs)
  }

  @Query(() => AssignResourceAlarmData)
  async assignResourceAlarmData(@Args() input: GetAssignResourceAlarmDataInput) {
    return this.alarmDataService.getAssignResourceAlarmDataInput(input)
  }
}
