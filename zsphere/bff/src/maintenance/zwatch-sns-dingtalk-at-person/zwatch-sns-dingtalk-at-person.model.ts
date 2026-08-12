import { ObjectType, Field } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class SNSDingTalkAtPerson {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  phoneNumber: string

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
export class QuerySNSDingTalkAtPersonListResp extends QueryCommonResponse(SNSDingTalkAtPerson) {}
