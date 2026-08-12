import { Field, Int, ObjectType, ArgsType } from '@nestjs/graphql'

import { Condition, QueryAction } from '@/common/model/action-query.model'

@ObjectType()
export class ConfigFile {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  path?: string

  @Field(() => String, { nullable: true })
  architecture?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string
}

@ArgsType()
export class ConfigFileArgs extends QueryAction {
  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => [Condition], { nullable: true })
  extraConditions?: Condition[]
}

@ObjectType()
export class ConfigFileList {
  @Field(() => [ConfigFile], { defaultValue: [], nullable: true })
  list?: ConfigFile[]

  @Field(() => Int)
  total: number
}
