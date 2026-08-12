import { Inject } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import {
  GetTwoFactorAuthenticationStateResp,
  LoginByAccountInput as ILoginByAccountInput,
  LogInInput as ILogInInput,
  LoginOAuthInput as ILoginOAuthInput,
  LoginOAuthResp,
  LoginResp
} from '../model/login.model'
import { LoginByAccountService } from './login-by-account/login-by-account.service'
import { LoginOAuthService } from './login-oauth/login-oauth'
import { LoginService as UILoginService } from './login.service'
import { LogInService } from './login/login.service'

@Resolver(() => LoginResp)
export class LoginResolver {
  @Inject() loginService: UILoginService
  @Inject() logInService: LogInService
  @Inject() loginByAccountService: LoginByAccountService
  @Inject() loginOAuthService: LoginOAuthService

  @Query(() => LoginResp, { nullable: true })
  async getUserBySessionId(@Args('sessionId') sessionId: string) {
    return await this.loginService.getUserBySessionId(sessionId)
  }

  @Mutation(() => LoginResp)
  async loginByAccount(@Args('input') input: ILoginByAccountInput) {
    const result = await this.loginByAccountService.action(input)
    return result
  }

  @Mutation(() => LoginResp)
  async logIn(@Args('input') input: ILogInInput) {
    return await this.logInService.action(input)
  }

  @Query(() => GetTwoFactorAuthenticationStateResp)
  async getTwoFactorAuthenticationState() {
    return this.loginService.getTwoFactorAuthenticationState()
  }

  @Mutation(() => LoginOAuthResp)
  async loginOAuth(@Args('input') input: ILoginOAuthInput) {
    return await this.loginOAuthService.action(input)
  }
}
