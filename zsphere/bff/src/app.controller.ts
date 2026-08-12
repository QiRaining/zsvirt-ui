import { Controller, Get, Inject, Req } from '@nestjs/common'
import { Request } from 'express'

import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'

import { AppService } from './app.service'

@Controller('api/ping')
export class AppController {
  @Logger(AppController.name) private logger: ZSLoggerService
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.debugJson({ port: process.env.PORT })
    return this.appService.getHello()
  }
}
