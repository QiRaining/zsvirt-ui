import { Module } from '@nestjs/common'

import { ScsiLunActionModule } from './action'
import { ScsiLunQueryService } from './scsi-lun-query/scsi-lun-query.service'
import { ScsiLunResolver } from './scsi-lun.resolver'

@Module({
  imports: [ScsiLunActionModule],
  providers: [ScsiLunResolver, ScsiLunQueryService],
  exports: [ScsiLunQueryService]
})
export class ScsiLunModule {}
