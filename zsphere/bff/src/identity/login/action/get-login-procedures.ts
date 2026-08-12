import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType } from '@nestjs/graphql'

import { GetLoginProceduresAction } from '@/api/zstack/GetLoginProceduresAction'
import { GetSignatureServerEncryptPublicKeyAction } from '@/api/zstack/GetSignatureServerEncryptPublicKeyAction'
import { ActionService } from '@/base/action-service'

@InputType()
export class GetLoginProceduresInput {
  @Field(() => String)
  username: string

  @Field(() => String)
  loginType: string
}

/**
 * 后端使用 LoginProceduresProperties 统一登录验证逻辑，比如开启验证码登录/密评等
 * 前端 LoginProceduresProperties 目前只适用于密评，其他都使用老的逻辑，因此这个类型的字段尽量使用 @nullable 因为不知道后端会返回什么
 */
@ObjectType()
class LoginProceduresProperties {
  @Field(() => String, { nullable: true })
  authentications?: string

  @Field(() => String, { nullable: true })
  ukeyType?: string

  @Field(() => String, { nullable: true })
  credentials?: string
}

@ObjectType()
class GetLoginProceduresResp {
  @Field(() => String)
  name: string

  @Field(() => LoginProceduresProperties)
  properties: LoginProceduresProperties
}

@ObjectType()
export class GetLoginProceduresOutput {
  @Field(() => [GetLoginProceduresResp])
  procedures: GetLoginProceduresResp[]

  @Field(() => String, { nullable: true })
  publicKey?: string
}

export class GetLoginProceduresService extends ActionService {
  @Inject() getLoginProceduresAction: GetLoginProceduresAction
  @Inject()
  getSignatureServerEncryptPublicKeyAction: GetSignatureServerEncryptPublicKeyAction

  @Mutation(() => GetLoginProceduresOutput)
  async getLoginProcedures(@Args('input') input: GetLoginProceduresInput) {
    try {
      const { procedures } = await this.getLoginProceduresAction.call(input)

      const { publicKey } = await this.getSignatureServerEncryptPublicKeyAction.call({})

      return { procedures, publicKey }
    } catch {
      return { procedures: [] }
    }
  }
}
