import { Module } from '@nestjs/common'

import { VmSpecActionModule } from './action/_module'
import { VmSpecQueryService } from './query/vm-spec-query.service'
import { VmSpecResolver } from './vm-spec.resolver'

@Module({
  imports: [VmSpecActionModule],
  providers: [VmSpecQueryService, VmSpecResolver],
  exports: [VmSpecQueryService]
})
export class VmSpecModule {}
