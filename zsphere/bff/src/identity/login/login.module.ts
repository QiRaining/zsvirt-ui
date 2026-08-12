import { Module, Global } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'

import { TransModule } from '../../common/trans/trans.module'
import { ZsSession } from '../../model/zs-session.model'
import { LoginActionModule } from './action/_modules'
import { LoginByAccountService } from './login-by-account/login-by-account.service'
import { LoginOAuthService } from './login-oauth/login-oauth'
import { LoginResolver } from './login.resolver'
import { LoginService } from './login.service'
import { LogInService } from './login/login.service'
import { SSOController } from './sso/sso.controller'

@Global()
@Module({
  imports: [
    TransModule,
    ZStackApiModule,
    LoginActionModule,
    SequelizeModule.forFeature([ZsSession])
  ],
  providers: [LoginResolver, LoginByAccountService, LoginService, LoginOAuthService, LogInService],
  controllers: [SSOController]
})
export class LoginModule {}
