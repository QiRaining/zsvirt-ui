import { Module } from '@nestjs/common'

import { DeleteThirdPartyAuthService } from './delete-thirdparty-auth'
import { SyncAccountsFromLdapServerService } from './sync-accounts-from-ldapServer'
import { TestConnectionThirdPartyService } from './test-connection'
import { UpdateThirdPartyAuthService } from './update-thirdparty-auth'

@Module({
  providers: [
    DeleteThirdPartyAuthService,
    UpdateThirdPartyAuthService,
    TestConnectionThirdPartyService,
    SyncAccountsFromLdapServerService
  ],
  exports: []
})
export class ThirdPartyAuthActionModule {}
