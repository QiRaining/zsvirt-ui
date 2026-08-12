import { Field, ObjectType, Int, Float } from '@nestjs/graphql'

import { L2Network } from '@/hardware-resource/l2-network/l2.network.model'

import { PhysicalNic } from '../pci-device/pci-device.model'
import { PhysicalNetworkType } from '../physical-network/physical-network.model'

@ObjectType()
export class HostNetworkBondingServiceRef {
  @Field(() => String)
  bondingUuid: string

  @Field(() => Int, { nullable: true })
  vlanId?: number

  @Field(() => PhysicalNetworkType, { nullable: true })
  serviceType?: PhysicalNetworkType

  @Field(() => [PhysicalNetworkType], { nullable: true })
  serviceTypes?: PhysicalNetworkType[]

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class HostNameAndUuid {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class L2NetworkNameAndUuidForBond {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class Bond {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => Boolean, { nullable: true })
  allSlavesActive?: boolean

  @Field(() => String, { nullable: true })
  bondingName?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => [String], { nullable: true })
  ipAddresses?: string[]

  @Field(() => [PhysicalNic], { nullable: true })
  slaves?: PhysicalNic[]

  @Field(() => String, { nullable: true })
  mac?: string

  @Field(() => Float, { nullable: true })
  speed?: number

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  miiStatus?: string

  @Field(() => String, { nullable: true })
  miimon?: string

  @Field(() => String, { nullable: true })
  mode?: string

  @Field(() => String, { nullable: true })
  xmitHashPolicy?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  bondingType?: string

  @Field(() => HostNameAndUuid, { nullable: true })
  host?: HostNameAndUuid

  @Field(() => [HostNetworkBondingServiceRef], {
    nullable: true,
    defaultValue: []
  })
  hostNetworkBondingServiceRef?: HostNetworkBondingServiceRef[]

  @Field(() => Boolean)
  availableVlanIds: boolean

  @Field(() => L2NetworkNameAndUuidForBond, { nullable: true })
  vSwitch?: L2NetworkNameAndUuidForBond
}

@ObjectType()
export class BondResp {
  @Field(() => [Bond])
  list: Bond[]

  @Field(() => Int)
  total?: number
}

@ObjectType()
export class BondResouceCountResp {
  @Field(() => Int, { nullable: true })
  bond?: number

  @Field(() => Int, { nullable: true })
  nic?: number
}

@ObjectType()
export class BondReleatedResource {
  @Field(() => Int, { nullable: true })
  host?: number

  @Field(() => Int, { nullable: true })
  vm?: number
}
