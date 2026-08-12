import { Inject } from '@nestjs/common'
import { Resolver, Args, Mutation } from '@nestjs/graphql'

import { LogOutInput, LogOutResp } from '../model/logout.model'
import { LogoutService } from './logout.service'

@Resolver(() => LogOutResp)
export class LogoutResolver {
  @Inject() logoutService: LogoutService

  @Mutation(() => LogOutResp)
  async logOut(@Args('input') input: LogOutInput) {
    return await this.logoutService.action(input)
  }
}
