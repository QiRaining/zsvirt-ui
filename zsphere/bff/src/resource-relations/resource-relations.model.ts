import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql'

import { UsedIp } from '@/zsphere-resource/vm-nic/vm-nic.model'

@ObjectType()
class HostNicItem {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  interfaceName?: string

  @Field(() => Boolean, { nullable: true })
  carrierActive?: boolean
}

@ObjectType()
class HostBondItem {
  @Field(() => String, { nullable: true })
  bondingName?: string

  @Field(() => String, { nullable: true })
  mode?: string

  @Field(() => String, { nullable: true })
  xmitHashPolicy?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => Boolean, { nullable: true })
  allSlavesActive?: boolean
}

@ObjectType()
class VmNicItem {
  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  mac?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  internalName?: string

  @Field(() => [UsedIp], { nullable: true })
  usedIps?: UsedIp[]
}

@ObjectType()
class NodeDetail {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  managementIp?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  architecture?: string

  @Field(() => Int, { nullable: true })
  vlanId?: number

  @Field(() => String, { nullable: true })
  physicalInterface?: string

  @Field(() => String, { nullable: true })
  bondingMode?: string

  @Field(() => String, { nullable: true })
  xmitHashPolicy?: string

  @Field(() => String, { nullable: true })
  systemSerialNumber?: string

  @Field(() => [HostNicItem], { nullable: true })
  hostNicList?: HostNicItem[]

  @Field(() => [HostBondItem], { nullable: true })
  hostBondList?: HostBondItem[]

  @Field(() => [VmNicItem], { nullable: true })
  vmNicList?: VmNicItem[]

  @Field(() => Int, { nullable: true })
  hostCount?: number

  @Field(() => Int, { nullable: true })
  clusterCount?: number

  @Field(() => Int, { nullable: true })
  portGroupCount?: number

  @Field(() => Int, { nullable: true })
  vmCount?: number

  @Field(() => String, { nullable: true })
  hypervisorType?: string

  @Field(() => Int, { nullable: true })
  baremetalChassisCount?: number
}

@ObjectType()
export class ResourceRelation {
  @Field(() => [String], { nullable: true })
  host?: string[]

  @Field(() => [String], { nullable: true })
  cluster?: string[]

  @Field(() => [String], { nullable: true })
  l2?: string[]

  @Field(() => [String], { nullable: true })
  l3?: string[]

  @Field(() => [String], { nullable: true })
  vm?: string[]
}

@ObjectType()
export class ResourceNode {
  @Field(() => String)
  id: string

  @Field(() => String)
  resourceType: string

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => ResourceRelation, { nullable: true })
  relations?: ResourceRelation

  @Field(() => NodeDetail, { nullable: true })
  detail?: NodeDetail
}

@ObjectType()
export class ResourceRelationsResp {
  @Field(() => [ResourceNode])
  nodes: ResourceNode[]

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  hostCount?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  clusterCount?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  l2Count?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  l3Count?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  vmCount?: number
}

@ArgsType()
export class ResourceRelationsArgs {
  @Field(() => String, { nullable: true })
  l2NetworkUuid?: string
}
