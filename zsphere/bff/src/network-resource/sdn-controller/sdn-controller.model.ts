import { Field, Float, Int, ObjectType, PickType } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'

@ObjectType()
export class VniRanges {
  @Field(() => Float, { nullable: true })
  startVni?: number

  @Field(() => Float, { nullable: true })
  endVni?: number
}

@ObjectType()
export abstract class AttachedVtepRefs {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => Float, { nullable: true })
  port?: number

  @Field(() => String, { nullable: true })
  poolUuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  vtepIp?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string
}

@ObjectType()
export abstract class AttachedVxlanNetworkRefs {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [String], { nullable: true })
  attachedClusterUuids?: string[]

  @Field(() => String, { nullable: true })
  physicalInterface?: string

  @Field(() => [String], { nullable: true })
  poolUuid?: string[]

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Float, { nullable: true })
  vni?: number

  @Field(() => String, { nullable: true })
  zoneUuid?: string
}

@ObjectType()
export class AttachedVniRanges extends PickType(VniRanges, ['startVni', 'endVni'], ObjectType) {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  l2NetworkUuid?: string
}

@ObjectType()
export abstract class VxlanPools {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [AttachedVtepRefs], { nullable: true })
  attachedVtepRefs?: AttachedVtepRefs[]

  @Field(() => [AttachedVxlanNetworkRefs], { nullable: true })
  attachedVxlanNetworkRefs?: AttachedVxlanNetworkRefs[]

  @Field(() => [AttachedVniRanges], { nullable: true })
  attachedVniRanges?: AttachedVniRanges[]

  @Field(() => String, { nullable: true })
  physicalInterface?: string

  @Field(() => String, { nullable: true })
  sdnControllerUuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string
}

@ObjectType()
export class SdnController {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  vendorType?: string

  @Field(() => [VniRanges], { nullable: true })
  vniRanges?: VniRanges[]

  @Field(() => [VxlanPools], { nullable: true })
  vxlanPools?: VxlanPools[]

  @Field(() => String, { nullable: true })
  vdsUuid?: string
}

@ObjectType()
export class SdnControllerList {
  @Field(() => [SdnController])
  list: SdnController[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class SdnControllerActionResp {
  @Field(() => [SdnController], { nullable: true })
  result?: SdnController[]

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
