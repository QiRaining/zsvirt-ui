import { ArgsType, Field, Int, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

import { PhysicalNic } from '../pci-device/pci-device.model'
import { PhysicalNetworkType } from '../physical-network/physical-network.model'

export enum PhysicalNetworkInterfaceQueryType {
  Normal = 'Normal'
}
registerEnumType(PhysicalNetworkInterfaceQueryType, {
  name: 'PhysicalNetworkInterfaceQueryType'
})

@ArgsType()
export class QueryPhysicalNetworkInterfaceArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => PhysicalNetworkInterfaceQueryType, {
    nullable: true,
    defaultValue: PhysicalNetworkInterfaceQueryType.Normal
  })
  declare type?: PhysicalNetworkInterfaceQueryType
}

@ObjectType()
export class PhysicalNetworkInterface {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  interfaceUuid: string

  @Field(() => String, { nullable: true })
  vlanId?: string

  @Field(() => [PhysicalNetworkType])
  serviceTypes: PhysicalNetworkType[]

  @Field(() => PhysicalNic)
  physicalNic: PhysicalNic
}

@ObjectType()
export class PhysicalNetworkInterfaceList {
  @Field(() => [PhysicalNetworkInterface], { defaultValue: [] })
  list?: PhysicalNetworkInterface[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

export enum InterfaceServiceQueryType {
  Normal = 'Normal'
}
registerEnumType(InterfaceServiceQueryType, {
  name: 'InterfaceServiceQueryType'
})

@ArgsType()
export class QueryInterfaceServiceArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => InterfaceServiceQueryType, {
    nullable: true,
    defaultValue: InterfaceServiceQueryType.Normal
  })
  declare type?: InterfaceServiceQueryType
}

@ObjectType()
export class InterfaceService {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  interfaceUuid: string

  @Field(() => String)
  interfaceName: string

  @Field(() => String, { nullable: true })
  vlanId?: string

  @Field(() => [PhysicalNetworkType])
  serviceTypes: PhysicalNetworkType[]

  @Field(() => String)
  hostUuid: string

  @Field(() => String)
  hostName: string

  @Field(() => String)
  hostIp: string

  @Field(() => String)
  clusterName: string
}

@ObjectType()
export class InterfaceServiceList {
  @Field(() => [InterfaceService], { defaultValue: [] })
  list?: InterfaceService[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
