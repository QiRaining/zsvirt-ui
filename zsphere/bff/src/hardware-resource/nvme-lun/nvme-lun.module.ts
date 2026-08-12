import { Module } from '@nestjs/common'

import { NVMeLunQueryService } from './nvme-lun-query.service'
import { NVMeLunResolver } from './nvme-lun.resolver'

@Module({
  providers: [NVMeLunResolver, NVMeLunQueryService],
  exports: [NVMeLunQueryService]
})
export class NVMeLunModule {}
