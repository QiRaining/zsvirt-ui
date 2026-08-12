import { Module } from '@nestjs/common'

import { ZOpsResolver } from './zops.resolver'
import { ZOpsService } from './zops.service'

@Module({
  providers: [ZOpsResolver, ZOpsService]
})
export class ZOpsModule {}
