// import { Module, CacheModule } from '@nestjs/common'
import { Module } from '@nestjs/common'

import { ServerLogModule } from './server-log/server-log.module'

@Module({
  imports: [ServerLogModule],
  providers: [],
  controllers: []
})
export class ApiInspectorModule {}
