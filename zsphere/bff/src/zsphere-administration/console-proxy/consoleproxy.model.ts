import { ObjectType, Field, Int, InputType } from '@nestjs/graphql'

@ObjectType()
export class ConsoleProxyAgent {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  managementIp?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  consoleProxyOverriddenIp?: string

  @Field(() => Int, { nullable: true })
  consoleProxyPort?: number

  @Field(() => String, { nullable: true })
  createDate?: string
}

@ObjectType()
export class ConsoleProxyAgentQueryResp {
  @Field(() => [ConsoleProxyAgent], { nullable: true })
  list?: ConsoleProxyAgent[]

  @Field(() => Int, { nullable: true })
  total?: number
}
