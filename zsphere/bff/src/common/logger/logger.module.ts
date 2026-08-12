import { DynamicModule, Global } from '@nestjs/common'

import { createLoggerProviders } from './logger.provider'
import { ZSLoggerService } from './logger.service'

export class LoggerModule {
  static forRoot(): DynamicModule {
    const loggerProviders = createLoggerProviders()
    return {
      global: true,
      module: LoggerModule,
      providers: [ZSLoggerService, ...loggerProviders],
      exports: [ZSLoggerService, ...loggerProviders]
    }
  }
}
