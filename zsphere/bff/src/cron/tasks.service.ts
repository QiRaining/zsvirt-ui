import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule'

import { ValidateSessionAction } from '@/api/zstack/ValidateSessionAction'
import { ZSLoggerService } from '@/common/logger/logger.service'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'

import { Logger } from '../common/logger/logger.decorator'

@Injectable()
export class TasksService {
  @Inject() pubSubService: PubSubService
  @Inject() httpService: HttpService
  @Inject() validateSessionAction: ValidateSessionAction
  @Logger(TasksService.name) logger: ZSLoggerService

  constructor(private schedulerRegistry: SchedulerRegistry) {
    console.log('TasksService constructor')
  }

  onApplicationBootstrap() {
    console.log('TasksService onApplicationBootstrap')
  }

  onModuleInit() {
    console.log('TasksService onModuleInit')
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron() {
    this.logger.debug('Called every 10 seconds')
  }
}
