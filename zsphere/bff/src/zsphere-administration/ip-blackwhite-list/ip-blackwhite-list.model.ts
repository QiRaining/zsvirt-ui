import { ObjectType, Field, Int, InputType } from '@nestjs/graphql'

@ObjectType()
export class IpBlackWhiteList {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  rule?: string

  @Field(() => String, { nullable: true })
  strategy?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => Boolean, { description: '数据保护是否通过', nullable: true })
  isValid?: boolean
}

@ObjectType()
export class IpBlackWhiteListQueryResp {
  @Field(() => [IpBlackWhiteList], { nullable: true })
  list?: IpBlackWhiteList[]

  @Field(() => Int, { nullable: true })
  total?: number
}
