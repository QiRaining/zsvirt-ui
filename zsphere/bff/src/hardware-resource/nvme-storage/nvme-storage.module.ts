import { Module } from '@nestjs/common'

import { NvmeTargetActionModule } from './action'
import { NvmeTargetQueryService } from './nvme-storage-query.service'
import { NvmeTargetResolver } from './nvme-storage.resolver'

@Module({
  imports: [NvmeTargetActionModule],
  providers: [NvmeTargetResolver, NvmeTargetQueryService],
  exports: [NvmeTargetQueryService]
})
export class NvmeTargetModule {}
