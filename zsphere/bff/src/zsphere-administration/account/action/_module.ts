import { Module } from '@nestjs/common'
import { ChangeAccountTypeService } from './change-account-type'
import { DeleteAccountService } from './delete-account'
import { UpdateAccountService } from './update-account'
import { UpdateAccountConfigService } from './update-account-config'
import { UpdateAccountQuotaService } from './update-account-quota'

@Module({
  providers: [
    DeleteAccountService,
    UpdateAccountService,
    UpdateAccountQuotaService,
    ChangeAccountTypeService,
    UpdateAccountConfigService
  ],
  exports: []
})
export class AccountActionModule {}
