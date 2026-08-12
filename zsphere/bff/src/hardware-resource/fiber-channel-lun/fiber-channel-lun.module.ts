import { Module } from '@nestjs/common'

import { ScsiLunModule } from '../scsi-lun/scsi-lun.module'
import { FiberChannelLunQueryService } from './fiber-channel-lun-query/fiber-channel-lun-query.service'
import { FiberChannelLunResolver } from './fiber-channel-lun.resolver'
import { FiberChannelLunService } from './fiber-channel-lun.service'

@Module({
  imports: [ScsiLunModule],
  providers: [FiberChannelLunResolver, FiberChannelLunService, FiberChannelLunQueryService]
})
export class FiberChannelLunModule {}
