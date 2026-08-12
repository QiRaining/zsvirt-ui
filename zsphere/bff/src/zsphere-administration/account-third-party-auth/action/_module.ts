import { Module } from '@nestjs/common'

import { DeleteAccountThirdPartyAuthService } from './delete-account-third-party-auth'
import { EditAccountThirdPartyAuthConfigService } from './edit-config'
import { UpdateAccountThirdPartyAuthService } from './update-account-third-party-auth'

@Module({
  providers: [
    DeleteAccountThirdPartyAuthService,
    UpdateAccountThirdPartyAuthService,
    // UpdateAccountThirdPartyAuthConfigInfoService,
    EditAccountThirdPartyAuthConfigService
  ],
  exports: []
})
export class AccountActionThirdPartyAuthModule {}
