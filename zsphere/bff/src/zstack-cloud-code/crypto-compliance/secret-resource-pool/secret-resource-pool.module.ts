import { Module } from '@nestjs/common'

import { PlatformCryptoCmplModule } from '../platform-crypto-cmpl/platform-crypto-cmpl.module'
import { SecretResourcePoolQueryService } from './query/secret-resource-pool.query.service'
import { SecretResourcePoolDataloader } from './secret-resource-pool.dataloader'
import { SecretResourcePoolResolver } from './secret-resource-pool.resolver'

@Module({
  imports: [PlatformCryptoCmplModule],
  providers: [
    SecretResourcePoolResolver,
    SecretResourcePoolQueryService,
    SecretResourcePoolDataloader
  ],
  exports: [SecretResourcePoolDataloader, SecretResourcePoolQueryService]
})
export class SecretResourcePoolModule {}
