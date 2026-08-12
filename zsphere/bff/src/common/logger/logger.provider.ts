import { Provider } from '@nestjs/common'

import { loggerNames } from './logger.decorator'
import { ZSLoggerService } from './logger.service'

function loggerFactory(logger: ZSLoggerService, name: string) {
  if (name) {
    logger.setName(name)
  }
  return logger
}

function createLoggerProvider(name: string): Provider<ZSLoggerService> {
  return {
    provide: `LoggerService${name}`,
    useFactory: logger => loggerFactory(logger, name),
    inject: [ZSLoggerService]
  }
}

export function createLoggerProviders(): Array<Provider<ZSLoggerService>> {
  return loggerNames.map(prefix => createLoggerProvider(prefix))
}
