import { ObjectType, Field, ArgsType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

import { HardwareState } from '../host/host.model'

@ObjectType()
export class Fan {
  @Field(() => String, { nullable: true })
  serialNumber?: string

  @Field(() => HardwareState, { nullable: true })
  state?: HardwareState

  @Field(() => String, { nullable: true })
  rpm?: string

  @Field(() => String)
  hostUuid: string
}

@ArgsType()
export class QueryFanArgs {
  @Field(() => String)
  hostUuid: string
}

@ObjectType()
export class QueryFanResp extends QueryCommonResponse(Fan) {}
