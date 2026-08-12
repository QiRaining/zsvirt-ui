import { Field, Int, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'
export enum VxlanPoolTypeInner {
  'VxlanNetworkPool' = 'vxlan-pool',
  'HardwareVxlanNetworkPool' = 'hardware-vxlan-pool'
}
import { ShareType } from '@/zsphere-administration/owner/owner.model'

export enum VxlanPoolQueryType {
  NORMAL = 'NORMAL'
}

registerEnumType(VxlanPoolQueryType, {
  name: 'VxlanPoolQueryType'
})
@InputType()
export class ShareVxlanPoolToPublicInput {
  @Field(() => [String])
  resourceUuids: string[]
}

@InputType()
export class RevokeVxlanPoolSharingFromPublicInput {
  @Field(() => [String])
  resourceUuids: string[]
}

@InputType()
export class AttachVxlanPoolToClusterInput {
  @Field(() => String)
  clusterUuid: string

  @Field(() => String)
  l2NetworkUuid: string

  @Field(() => [String])
  systemTags: string[]
}

@ObjectType()
export class VxlanPoolRelatedResource {
  @Field(() => Int)
  vxlan: number

  @Field(() => Int)
  cluster: number
}
@ObjectType()
export class VniRange {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  startVni: string

  @Field(() => String, { nullable: true })
  endVni: string

  @Field(() => String, { nullable: true })
  createDate: string
}

@ObjectType()
export class AttachedVtepRefsType {
  @Field(() => String, { nullable: true })
  vtepIp: string

  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  port: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  hostUuid: string

  @Field(() => String, { nullable: true })
  poolUuid: string
}

@ObjectType()
export class AttachedVxlanNetworkRefsType {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  vni: string

  @Field(() => String, { nullable: true })
  createDate: string
}

@ObjectType()
export class VxlanPool {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => String, { nullable: true })
  physicalInterface: string

  @Field(() => [AttachedVxlanNetworkRefsType], { nullable: true })
  attachedVxlanNetworkRefs: AttachedVxlanNetworkRefsType[]

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => [String], { nullable: true })
  attachedClusterUuids: string[]

  @Field(() => [String], { nullable: true })
  attachedCidr: string[]

  @Field(() => [AttachedVtepRefsType], { nullable: true })
  attachedVtep: AttachedVtepRefsType[]

  @Field(() => Int, { nullable: true })
  vlan: number

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => Int, { nullable: true })
  vtepNum: number

  @Field(() => [VniRange])
  vniRange: VniRange[]
}

@ObjectType()
export class VxlanPoolQueryResp {
  @Field(() => [VxlanPool], { nullable: true })
  list?: VxlanPool[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class VxlanPoolQueryVtepResp {
  @Field(() => [AttachedVtepRefsType], { nullable: true })
  list?: AttachedVtepRefsType[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class VniRangeResp {
  @Field(() => [VniRange], { nullable: true })
  list?: VniRange[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class VxlanPoolActionResp {
  @Field(() => VxlanPool, { nullable: true })
  inventory?: VxlanPool

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
