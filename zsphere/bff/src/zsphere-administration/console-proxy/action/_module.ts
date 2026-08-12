import { Module } from '@nestjs/common'

import { ReconnectConsoleProxyService } from './reconnect-console-proxy'
import { UpdateConsoleProxyService } from './update-console-proxy'

@Module({
  providers: [ReconnectConsoleProxyService, UpdateConsoleProxyService],
  exports: []
})
export class ConsoleProxyActionModule {}
