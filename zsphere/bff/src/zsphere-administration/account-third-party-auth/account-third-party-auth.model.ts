import { Field, ObjectType, Int } from '@nestjs/graphql'

@ObjectType()
export class AccounThirdPartyAuthResourceref {
  @Field(() => Int, { nullable: true })
  userCount?: number
}

@ObjectType()
export class RedirectTemplateRef {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  redirectTemplate?: string
}

@ObjectType()
export class AccountThirdPartyAuth {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  accountUuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  usernameProperty?: string

  @Field(() => String, { nullable: true })
  loginMNUrl?: string

  @Field(() => String, { nullable: true })
  redirectUrl?: string

  @Field(() => String, { nullable: true })
  userinfoUrl?: string

  @Field(() => String, { nullable: true })
  logoutUrl?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => AccounThirdPartyAuthResourceref, { nullable: true })
  bindResourceref?: AccounThirdPartyAuthResourceref

  @Field(() => String, { nullable: true })
  authorizationUrl?: string

  @Field(() => String, { nullable: true })
  clientId?: string

  @Field(() => String, { nullable: true })
  clientSecret?: string

  @Field(() => String, { nullable: true })
  tokenUrl?: string

  @Field(() => String, { nullable: true })
  casServerLoginUrl?: string

  @Field(() => String, { nullable: true })
  casServerUrlPrefix?: string

  @Field(() => String, { nullable: true })
  state?: string
}

@ObjectType()
export class OAuthClientSecretResult {
  @Field(() => String, { nullable: true })
  clientSecret?: string
}

@ObjectType()
export class AccountThirdPartyAuthResponse {
  @Field(() => [AccountThirdPartyAuth])
  list: AccountThirdPartyAuth[]

  @Field(() => Int, { nullable: true })
  total?: number
}
