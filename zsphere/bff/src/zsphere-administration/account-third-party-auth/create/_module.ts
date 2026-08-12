import { Module } from '@nestjs/common'

import { AddSSOThirdPartyAuthService } from './add-sso-third-party-auth'

@Module({
  providers: [AddSSOThirdPartyAuthService],
  exports: []
})
export class AccountThirdPartyAuthCreateModule {}
