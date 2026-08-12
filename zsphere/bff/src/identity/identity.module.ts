import { Module } from '@nestjs/common'

import { CCSCertificateModule } from './ccs-certificate/css-certificate.module'
import { LoginModule } from './login/login.module'
import { LogoutModule } from './logout/logout.module'
import { ValidatePasswordModule } from './validate/validate.module'

@Module({
  imports: [LoginModule, LogoutModule, ValidatePasswordModule, CCSCertificateModule]
})
export class IdentityModule {}
