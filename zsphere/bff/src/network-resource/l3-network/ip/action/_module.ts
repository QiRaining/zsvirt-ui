import { Module } from '@nestjs/common'

import { AddIpRangeService } from './add-ip-range'
import { AddIpRangeByCidrService } from './add-ip-range-by-cidr'
import { DeleteIpRangeService } from './delete-ip-range'

@Module({
  providers: [AddIpRangeService, AddIpRangeByCidrService, DeleteIpRangeService],
  exports: []
})
export class IpActionModule {}
