import { Module } from '@nestjs/common'

import { RefreshFiberChannelStorageService } from './refresh-iscsi-server'

@Module({
  providers: [RefreshFiberChannelStorageService],
  exports: []
})
export class FiberChannelStorageActionModule {}
