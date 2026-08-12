import { Module } from '@nestjs/common'

import { KmsProviderActionModule } from './action/_module'
import { KmsProviderResolver } from './kms-provider.resolver'
import { KmsProviderQueryService } from './kms-provider.service'

@Module({
  imports: [KmsProviderActionModule],
  providers: [KmsProviderResolver, KmsProviderQueryService]
})
export class KmsProviderModule {}
