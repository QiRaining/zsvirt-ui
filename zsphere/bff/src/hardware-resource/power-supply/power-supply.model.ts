import { ObjectType, Field, ArgsType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

import { HardwareState } from '../host/host.model'

@ObjectType()
export class PowerSupply {
  @Field(() => String, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => HardwareState, { nullable: true })
  state?: HardwareState

  @Field(() => String, { nullable: true })
  manufacturer?: string

  @Field(() => String, { nullable: true })
  model?: string

  @Field(() => String, { nullable: true })
  ratedPower?: string

  @Field(() => String, { nullable: true })
  currentPower?: string

  @Field(() => String)
  hostUuid: string
}

@ArgsType()
export class QueryPowerSupplyArgs {
  @Field(() => String)
  hostUuid: string
}

@ObjectType()
export class QueryPowerSupplyResp extends QueryCommonResponse(PowerSupply) {}
