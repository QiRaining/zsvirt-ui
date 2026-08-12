import { ArgsType, Field, ObjectType, Int } from '@nestjs/graphql'

import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

@ArgsType()
@ObjectType()
export class NetworkTopologyRelationQuery {
  @Field(() => [String], { nullable: true })
  vmUuids?: string[]

  @Field(() => [String], { nullable: true })
  l3NetworkUuids?: string[]

  @Field(() => String, { nullable: true })
  zoneUuid?: string
}

@ArgsType()
@ObjectType()
export class ResourceAndRelationByTypeQuery {
  @Field(() => [String], { nullable: true })
  uuids?: string[]

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => Boolean, { nullable: true })
  needInfo?: boolean
}

@ObjectType()
export class DataInNetworkTopology {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => VmInstance, { nullable: true })
  vm: VmInstance

  @Field(() => L3Network, { nullable: true })
  l3Netowrk: L3Network
}

@ObjectType()
export class NetworkTopology {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  category: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => Int, { nullable: true })
  vmCount: number

  @Field(() => DataInNetworkTopology, { nullable: true })
  data: DataInNetworkTopology
}

@ObjectType()
export class QueryNetworkTopologyResp {
  @Field(() => [NetworkTopology])
  list: NetworkTopology[]

  @Field(() => Int, { nullable: true })
  total: number
}

@ObjectType()
export class NetworkTopologyRelation {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  l3NetworkUuid: string
}

@ObjectType()
export class QueryNetworkTopologyRelationResp {
  @Field(() => [NetworkTopologyRelation])
  list: NetworkTopologyRelation[]

  @Field(() => Int, { nullable: true })
  total: number
}

@ObjectType()
export class QueryResourceAndRelationResp {
  @Field(() => [NetworkTopology])
  resourceList: NetworkTopology[]

  @Field(() => [NetworkTopologyRelation])
  relationList: NetworkTopologyRelation[]

  @Field(() => Int, { nullable: true })
  total: number
}
