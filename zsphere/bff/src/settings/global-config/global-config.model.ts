import { ArgsType, Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum GlobalConfigQueryType {
  Normal = 'Normal'
}

registerEnumType(GlobalConfigQueryType, {
  name: 'GlobalConfigQueryType'
})

@ArgsType()
export class QueryGlobalConfigArgs extends QueryAction {
  @Field(() => GlobalConfigQueryType, {
    defaultValue: GlobalConfigQueryType.Normal
  })
  declare type?: GlobalConfigQueryType

  @Field(() => String, { nullable: true, defaultValue: 'category' })
  declare sortBy?: string

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  declare includeUiConfig?: boolean
}

@ObjectType()
export class GlobalConfig {
  @Field(() => String, { defaultValue: 'ui' })
  category: string

  @Field(() => String)
  defaultValue: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String)
  name: string

  @Field(() => String)
  value: string

  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  id?: string

  @Field(() => Boolean, { description: '数据保护是否通过', nullable: true })
  isValid?: boolean
}

@ObjectType()
export class GlobalConfigList {
  @Field(() => [GlobalConfig], { defaultValue: [] })
  list?: GlobalConfig[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
@ObjectType()
export class GlobalConfigCpuMode {
  @Field(() => String)
  cpuMode: string
}
