import { ObjectType, Field, ArgsType, Int } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

@ArgsType()
export class QueryGlobalConfigTemplateArgs extends QueryAction {
  @Field(() => String, { nullable: true, defaultValue: 'uuid' })
  declare sortBy?: string
}

@ObjectType()
export class GlobalConfigTemplate {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@ObjectType()
export class GlobalConfigTemplateList {
  @Field(() => [GlobalConfigTemplate], { defaultValue: [] })
  list?: GlobalConfigTemplate[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
