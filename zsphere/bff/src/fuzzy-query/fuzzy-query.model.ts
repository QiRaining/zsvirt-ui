import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql'

import { Condition, QueryAction } from '@/common/model/action-query.model'

@ArgsType()
@ObjectType()
export class FuzzyQueryArgs extends QueryAction {
  @Field(() => String)
  resourceType: string

  @Field(() => [Condition])
  resourceConditions: Condition[]
}

@ObjectType()
export class ConditionCount {
  @Field(() => String)
  key: string

  @Field(() => Int)
  count: number
}

@ObjectType()
export class FuzzyQueryResponse {
  @Field(() => [ConditionCount])
  conditionCount: ConditionCount[]
}
