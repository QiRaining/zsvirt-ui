import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType } from '@nestjs/graphql'

import { GetLoginCaptchaAction } from '@/api/zstack/GetLoginCaptchaAction'
import { RefreshCaptchaAction } from '@/api/zstack/RefreshCaptchaAction'
import { ActionService } from '@/base/action-service'

@InputType()
export class GetLoginCaptchaPayload {
  @Field(() => String)
  resourceName: string

  @Field(() => String)
  loginType: string

  @Field(() => String, { nullable: true })
  captchaUuid?: string
}

@ObjectType()
export class GetLoginCaptchaResp {
  @Field(() => String, { nullable: true })
  captcha?: string

  @Field(() => String, { nullable: true })
  captchaUuid?: string
}

export class GetLoginCaptchaService extends ActionService {
  @Inject() getLoginCaptchaAction: GetLoginCaptchaAction
  @Inject() refreshCaptchaAction: RefreshCaptchaAction

  @Mutation(() => GetLoginCaptchaResp)
  async getLoginCaptcha(@Args('input') input: GetLoginCaptchaPayload) {
    return await this.getLoginCaptchaAction.call(input)
  }

  @Mutation(() => GetLoginCaptchaResp)
  async refreshCaptcha(@Args('captchaUuid') captchaUuid: string) {
    return await this.refreshCaptchaAction.call({ uuid: captchaUuid })
  }
}
