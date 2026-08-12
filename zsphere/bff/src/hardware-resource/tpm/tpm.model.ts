import { ArgsType, Field, ObjectType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

@ObjectType()
export class TpmInventory {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [String], { nullable: true })
  hostRefs?: any[]
}

@ArgsType()
export class QueryTpmArgs extends QueryAction {
  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string
}
