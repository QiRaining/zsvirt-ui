import { Module } from '@nestjs/common'

import { RefreshNvmeTargetService } from './refresh-iscsi-server'

@Module({
  providers: [RefreshNvmeTargetService],
  exports: []
})
export class NvmeTargetActionModule {}
