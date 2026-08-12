import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { ValidatePassword } from './validate.model'
import { ValidatePasswordService } from './validate.service'

@Resolver(() => ValidatePassword)
export class ValidatePasswordResolver {
  @Inject() validatePasswordService: ValidatePasswordService

  @Query(() => ValidatePassword)
  async validatePassword(
    @Args('loginName') loginName: string,
    @Args('password') password: string,
    @Args('loginType') loginType: string
  ): Promise<any> {
    const resp = await this.validatePasswordService.validatePassword(loginName, password, loginType)
    return { deleteAble: resp }
  }
}
