import { ObjectType, Field } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class SNSWeComAtPerson {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  userId: string

  @Field(() => String, { nullable: true })
  endpointUuid?: string

  @Field(() => String, { nullable: true })
  remark?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}
@ObjectType()
export class QuerySNSWeComAtPersonListResp extends QueryCommonResponse(SNSWeComAtPerson) {}
