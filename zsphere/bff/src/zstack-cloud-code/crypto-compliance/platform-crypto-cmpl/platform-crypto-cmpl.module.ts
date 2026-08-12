import { Module } from '@nestjs/common'

import { GlobalConfigQueryService } from '@/settings/global-config/global-config-query/global-config-query.service'

import { PlatformCryptoCmplActionModule } from './action/_module'
import { PlatformCryptoCmplResolver } from './platform-crypto-cmpl.resolver'
import { PlatformCryptoCmplService } from './platform-crypto-cmpl.service'

@Module({
  imports: [PlatformCryptoCmplActionModule],
  providers: [PlatformCryptoCmplResolver, PlatformCryptoCmplService, GlobalConfigQueryService],
  exports: [PlatformCryptoCmplService]
})
export class PlatformCryptoCmplModule {}
