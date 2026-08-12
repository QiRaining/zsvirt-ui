import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType } from '@nestjs/graphql'

import { GetTwoFactorAuthenticationSecretAction } from '@/api/zstack/GetTwoFactorAuthenticationSecretAction'
import { ActionService } from '@/base/action-service'
import { TwoFactorAuthenticationSecretStatus } from '@/common/enum'
import { Decrypt } from '@/utils/aesCipher'

@InputType()
export class GetTwoFactorAuthenticationSecretPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  password: string

  @Field(() => String)
  type: string

  @Field(() => String, { nullable: true })
  captchaUuid?: string

  @Field(() => String, { nullable: true })
  verifyCode?: string
}

@ObjectType()
export class GetTwoFactorAuthenticationSecretResp {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  secret?: string

  @Field(() => String, { nullable: true })
  userUuid?: string

  @Field(() => String, { nullable: true })
  userType?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => TwoFactorAuthenticationSecretStatus, { nullable: true })
  status?: TwoFactorAuthenticationSecretStatus
}

export class GetTwoFactorAuthenticationSecretService extends ActionService {
  @Inject()
  getTwoFactorAuthenticationSecretAction: GetTwoFactorAuthenticationSecretAction

  @Mutation(() => GetTwoFactorAuthenticationSecretResp)
  async getTwoFactorAuthenticationSecret(
    @Args('input') input: GetTwoFactorAuthenticationSecretPayload
  ): Promise<GetTwoFactorAuthenticationSecretResp> {
    const isLdap = input.type === 'ldap'
    const password = isLdap ? Decrypt(input.password) : input.password

    const { inventory } = await this.getTwoFactorAuthenticationSecretAction.call({
      ...input,
      password
    })
    return {
      ...inventory,
      status: inventory?.status as TwoFactorAuthenticationSecretStatus
    }
  }
}
