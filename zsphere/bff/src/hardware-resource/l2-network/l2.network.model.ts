import { ArgsType, Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionInput } from '@/common/model/action.model'
import { CreateBondPayload } from '@/hardware-resource/bond/action/create'
import { CreateL3NetworkInputParam } from '@/network-resource/l3-network/l3-network.model'
import { VxlanPool } from '@/network-resource/vxlan-pool/vxlan-pool.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { AccountInfo } from '@/zsphere-administration/scheduler-job/scheduler-job.model'
import { ResourceWithAttributes } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.model'

import { Cluster } from '../cluster/cluster.model'
import { Zone } from '../zone/zone.model'

export enum l2NetworkType {
  'L2NoVlanNetwork' = 'L2NoVlanNetwork',
  'L2VlanNetwork' = 'L2VlanNetwork',
  'VxlanNetwork' = 'VxlanNetwork',
  'HardwareVxlanNetwork' = 'HardwareVxlanNetwork',
  'VxlanNetworkPool' = 'VxlanNetworkPool',
  'VirtualSwitch' = 'virtualSwitch',
  'PortGroup' = 'PortGroup'
}
registerEnumType(l2NetworkType, {
  name: 'l2NetworkType'
})

export enum L2NetworkQueryType {
  'Normal' = 'Normal',
  'Admin' = 'Admin',
  'Mine' = 'Mine',
  'Share' = 'Share',
  'ClusterAttachableL2network' = 'ClusterAttachableL2network',
  'BaremetalClusterAttachableL2network' = 'BaremetalClusterAttachableL2network',
  'L2NetworkInZone' = 'L2NetworkInZone',
  'SharedResource' = 'ShareResource',
  'CreateL3DefaultCandidate' = 'CreateL3DefaultCandidate',
  'CreateL3AllCandidate' = 'CreateL3AllCandidate',
  'AttachedVxlanNetwork' = 'AttachedVxlanNetwork',
  'ZSV_SHARED_RESOURCE' = 'ZSV_SHARED_RESOURCE',
  ZSV_NOT_SHARED_RESOURCE = 'ZSV_NOT_SHARED_RESOURCE'
}

registerEnumType(L2NetworkQueryType, {
  name: 'L2NetworkQueryType'
})

@ArgsType()
export class QueryL2NetworkArgs extends QueryAction {
  @Field(() => L2NetworkQueryType, {
    nullable: true,
    defaultValue: L2NetworkQueryType.Normal
  })
  declare type?: L2NetworkQueryType

  @Field(() => Boolean, { nullable: true })
  isCount?: boolean
}

@ArgsType()
export class QueryPhysicalInterfaceArgs {
  @Field(() => [String])
  clusterUuids?: string[]
}

@InputType()
export class ShareL2NetworkToPublicPrarm {
  @Field(() => String)
  uuid: string
}

@InputType()
export class ShareL2NetworkToPublicActionInput {
  @Field(() => [ShareL2NetworkToPublicPrarm])
  payload: ShareL2NetworkToPublicPrarm[]

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
export class DetachL2NetworksFromClusterInput {
  @Field(() => String)
  clusterUuid: string

  @Field(() => String)
  l2NetworkUuid: string
}

@ObjectType()
export class L2NetworkSystemTags {
  @Field(() => String, { nullable: true })
  bondingMode?: string

  @Field(() => String, { nullable: true })
  xmitHashPolicy?: string
}

@ObjectType()
export class PortGroup {
  @Field(() => Int)
  vlanId: number

  @Field(() => Int, { nullable: true })
  virtualNetworkId?: number
}

@ObjectType()
export class AttachedHostRef {
  @Field(() => String)
  hostUuid: string
}

@ObjectType()
export class L2Network extends ResourceWithAttributes {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  poolUuid?: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => String, { nullable: true })
  physicalInterface: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  vni: string

  @Field(() => String, { nullable: true })
  vSwitchType: string

  @Field(() => String, { nullable: true })
  vlan: string

  @Field(() => String, { nullable: true })
  virtualNetworkId: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => Boolean, { nullable: true })
  enableSRIOV: boolean

  // @Field(() => Boolean, { nullable: true })
  // toPublic: boolean

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => [String], { nullable: true })
  attachedClusterUuids: string[]

  @Field(() => AccountInfo, { nullable: true })
  owner?: AccountInfo

  @Field(() => Zone, { nullable: true })
  zone?: Zone

  @Field(() => [Cluster], { nullable: true })
  clusters?: Cluster[]

  @Field(() => Int, { nullable: true })
  l3networkNum?: number[]

  @Field(() => VxlanPool, { nullable: true })
  vxlanPool?: VxlanPool

  @Field(() => L2NetworkSystemTags, { nullable: true })
  systemTags?: L2NetworkSystemTags

  @Field(() => Boolean, { nullable: true })
  isDefault?: boolean

  @Field(() => [PortGroup], { nullable: true, defaultValue: [] })
  portGroups?: PortGroup[]

  @Field(() => [AttachedHostRef], { nullable: true })
  attachedHostRefs?: AttachedHostRef[]

  @Field(() => Boolean, { nullable: true })
  isUplinkBondingExist?: boolean

  @Field(() => Boolean, { nullable: true })
  isForStorageKernel?: boolean
}

@InputType()
export class AttachL2NetworkToClusterHostParams {
  @Field(() => String)
  clusterUuid: string

  @Field(() => String)
  hostParams: string
}

@InputType()
export class CreateL2NetworkInput {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => l2NetworkType, { nullable: true })
  type?: l2NetworkType

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => String, { nullable: true })
  physicalInterface?: string

  @Field(() => String, { nullable: true })
  cidr?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => [String], { nullable: true })
  clusterUuids?: string[]

  @Field(() => Int, { nullable: true })
  vlan?: number

  @Field(() => Int, { nullable: true })
  vni?: number

  @Field(() => String, { nullable: true })
  poolUuid?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => [String], { nullable: true })
  userTags?: string[]

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => Int, { nullable: true })
  startVni?: number

  @Field(() => Int, { nullable: true })
  endVni?: number

  @Field(() => String, { nullable: true })
  l2NetworkUuid?: string

  @Field(() => String, { nullable: true })
  vSwitchType?: string

  @Field(() => CreateL3NetworkInputParam, { nullable: true })
  l3netowrkParam?: CreateL3NetworkInputParam

  @Field(() => [CreateBondPayload], { nullable: true, defaultValue: [] })
  createBondPayloads?: CreateBondPayload[]

  @Field(() => [AttachL2NetworkToClusterHostParams], {
    nullable: true,
    defaultValue: []
  })
  attachL2NetworkToClusterHostParams?: AttachL2NetworkToClusterHostParams[]
}

@InputType()
export class UpdateL2NetworkInput {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@ObjectType()
export class L2NetworkQueryResp extends QueryCommonResponse(L2Network) {}

@ObjectType()
export class PhysicalInterface {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string
}

@ObjectType()
export class PhysicalInterfaceQueryResp extends QueryCommonResponse(PhysicalInterface) {}
