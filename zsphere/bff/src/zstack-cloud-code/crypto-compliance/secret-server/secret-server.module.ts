import { Module } from '@nestjs/common'

import { PlatformCryptoCmplModule } from '../platform-crypto-cmpl/platform-crypto-cmpl.module'
import { SecretServerActionModule } from './action/_module'
import { SecretServerQueryService } from './query/secret-server.query.service'
import { SecretServerDataloader } from './secret-server.dataloader'
import { SecretServerResolver } from './secret-server.resolver'

@Module({
  imports: [SecretServerActionModule, PlatformCryptoCmplModule],
  providers: [SecretServerResolver, SecretServerQueryService, SecretServerDataloader],
  exports: [SecretServerDataloader, SecretServerQueryService]
})
export class SecretServerModule {}
