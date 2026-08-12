import { ArgsType, Field, Int, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

import { Bond } from '../bond/bond.model'
import { PhysicalNetworkType } from '../physical-network/physical-network.model'

export enum PhysicalNetworkBondQueryType {
  Normal = 'Normal'
}
registerEnumType(PhysicalNetworkBondQueryType, {
  name: 'PhysicalNetworkBondQueryType'
})

@ArgsType()
export class QueryPhysicalNetworkBondArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => PhysicalNetworkBondQueryType, {
    nullable: true,
    defaultValue: PhysicalNetworkBondQueryType.Normal
  })
  declare type?: PhysicalNetworkBondQueryType
}

@ObjectType()
export class PhysicalNetworkBond {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  bondingUuid: string

  @Field(() => String, { nullable: true })
  vlanId?: string

  @Field(() => [PhysicalNetworkType])
  serviceTypeList: PhysicalNetworkType[]

  @Field(() => Bond)
  bond: Bond
}

@ObjectType()
export class PhysicalNetworkBondList {
  @Field(() => [PhysicalNetworkBond], { defaultValue: [] })
  list?: PhysicalNetworkBond[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
