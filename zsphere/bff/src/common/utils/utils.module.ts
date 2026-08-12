import { Module } from '@nestjs/common'

import { ZsLoggerService } from './zs-logger/zs-logger.service'

@Module({
  providers: [ZsLoggerService],
  exports: [ZsLoggerService]
})
export class UtilsModule {}
