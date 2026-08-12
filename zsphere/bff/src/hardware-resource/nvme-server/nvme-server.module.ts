import { Module } from '@nestjs/common'

import { NvmeServerServiceActionModule } from './action/_module'
import { NvmeServerQueryService } from './nvme-server-query.service'
import { NvmeServerResolver } from './nvme-server.resolver'

@Module({
  imports: [NvmeServerServiceActionModule],
  providers: [NvmeServerResolver, NvmeServerQueryService],
  exports: [NvmeServerQueryService]
})
export class NvmeServerModule {}
