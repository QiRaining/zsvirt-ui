import { ArgsType, Field, Int } from '@nestjs/graphql'

@ArgsType()
export class ZceXTestConnectionActionParamArgs {
  @Field(() => String, { nullable: true })
  managementIp?: string

  @Field(() => Int, { nullable: true })
  port?: number

  @Field(() => String, { nullable: true })
  adminToken?: string
}
