import { Inject } from '@nestjs/common'
import { Query, Resolver, Args, ResolveField, Parent } from '@nestjs/graphql'

import { GetCurrentTimeAction } from '@/api/zstack/GetCurrentTimeAction'
import { QueryAction } from '@/common/model/action-query.model'
import { ZOp } from '@/common/zql'

import {
  SchedulerTrigger as ISchedulerTrigger,
  SchedulerTriggerList as ISchedulerTriggerList
} from './scheduler-trigger.model'
import { SchedulerTriggerService } from './scheduler-trigger.service'

@Resolver(() => ISchedulerTrigger)
export class SchedulerTriggerResolver {
  @Inject() schedulerTriggerService: SchedulerTriggerService
  @Inject() getCurrentTimeAction: GetCurrentTimeAction

  @Query(() => ISchedulerTriggerList)
  schedulerTriggerList(@Args() queryArgs: QueryAction) {
    // 过滤掉项目登录限制时间功能内部创建的cron类型的定时器
    const { conditions = [] } = queryArgs
    queryArgs.conditions = conditions.concat([
      {
        key: 'schedulerType',
        value: 'cron',
        op: ZOp.ne
      }
    ])

    let fn
    switch (queryArgs?.type) {
      case 'AVALIABLE':
        fn = this.schedulerAvaliableTriggerList(queryArgs)
        break
      case 'DONE':
        fn = this.schedulerDoneTriggerList(queryArgs)
        break
      default:
        fn = this.schedulerTriggerService.schedulerTriggerList(queryArgs)
    }
    return fn
  }

  @ResolveField()
  async owner(@Parent() schedulerTrigger: ISchedulerTrigger) {
    return this.schedulerTriggerService.getAccount(schedulerTrigger.uuid)
  }

  @ResolveField()
  async state(@Parent() schedulerTrigger: ISchedulerTrigger) {
    const resp = await this.getCurrentTimeAction.call({})
    const nowTime = resp?.currentTime?.MillionSeconds || new Date().getTime()
    if (new Date(schedulerTrigger.stopTime).getTime() < nowTime) {
      return 'Completed'
    } else {
      return 'Running'
    }
  }

  @Query(() => ISchedulerTriggerList)
  schedulerAvaliableTriggerList(@Args() queryArgs: QueryAction) {
    return this.schedulerTriggerService.schedulerAvaliableTriggerList(queryArgs)
  }

  @Query(() => ISchedulerTriggerList)
  schedulerDoneTriggerList(@Args() queryArgs: QueryAction) {
    return this.schedulerTriggerService.schedulerDoneTriggerList(queryArgs)
  }
}
