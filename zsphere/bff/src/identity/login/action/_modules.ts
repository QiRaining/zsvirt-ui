import { Module } from '@nestjs/common'

import { GetLoginCaptchaService } from './get-login-captcha'
import { GetLoginProceduresService } from './get-login-procedures'
import { GetTwoFactorAuthenticationSecretService } from './get-two-factor-authentication-secret'

@Module({
  providers: [
    GetLoginCaptchaService,
    GetTwoFactorAuthenticationSecretService,
    GetLoginProceduresService
  ]
})
export class LoginActionModule {}
