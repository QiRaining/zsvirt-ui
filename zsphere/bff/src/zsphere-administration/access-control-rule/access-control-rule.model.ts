import { ArgsType, Field, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum AccessControlRuleType {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

registerEnumType(AccessControlRuleType, {
  name: 'AccessControlRuleType'
})

@ObjectType()
export class AccessControlRule {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  rule: string

  @Field(() => AccessControlRuleType)
  strategy: AccessControlRuleType

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => Boolean, { description: '数据保护是否通过', nullable: true })
  isValid?: boolean
}

@ObjectType()
export class AccessControlRuleList extends QueryCommonResponse(AccessControlRule) {
  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

export enum AccessControlRuleQueryType {
  Normal = 'Normal'
}
registerEnumType(AccessControlRuleQueryType, {
  name: 'AccessControlRuleQueryType'
})

@ArgsType()
export class QueryAccessControlRuleArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => AccessControlRuleQueryType, {
    nullable: true,
    defaultValue: AccessControlRuleQueryType.Normal
  })
  type?: AccessControlRuleQueryType
}
