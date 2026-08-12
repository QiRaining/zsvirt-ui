import { Module } from '@nestjs/common'

import { FiberChannelStorageActionModule } from './action'
import { FiberChannelStorageQueryService } from './fiber-channel-storage-query/fiber-channel-storage-query.service'
import { FiberChannelStorageResolver } from './fiber-channel-storage.resolver'

@Module({
  imports: [FiberChannelStorageActionModule],
  providers: [FiberChannelStorageResolver, FiberChannelStorageQueryService]
})
export class FiberChannelStorageModule {}
