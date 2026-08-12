import { Module } from '@nestjs/common'

import { ScsiLunModule } from '../scsi-lun/scsi-lun.module'
import { IscsiLunQueryService } from './iscsi-lun-query/iscsi-lun-query.service'
import { IscsiLunResolver } from './iscsi-lun.resolver'
import { IscsiLunService } from './iscsi-lun.service'

@Module({
  imports: [ScsiLunModule],
  providers: [IscsiLunResolver, IscsiLunService, IscsiLunQueryService],
  exports: [IscsiLunQueryService]
})
export class IscsiLunModule {}
