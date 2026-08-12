import { ArgsType, Field, InputType, Int, ObjectType, Float } from '@nestjs/graphql'

import { ShareType } from '@/zsphere-administration/owner/owner.model'

@ObjectType()
export class IpCapacity {
  @Field(() => Float, { nullable: true })
  totalCapacity?: number

  @Field(() => Float, { nullable: true })
  availableCapacity?: number

  @Field(() => Float, { nullable: true })
  ipv4AvailableCapacity?: number

  @Field(() => Float, { nullable: true })
  ipv4TotalCapacity?: number

  @Field(() => Float, { nullable: true })
  ipv6AvailableCapacity?: number

  @Field(() => Float, { nullable: true })
  ipv6TotalCapacity?: number

  @Field(() => Float, { nullable: true })
  ipv4UsedIpAddressNumber?: number
}

@ObjectType()
export class CheckIpAvailabilityResult {
  @Field(() => Boolean)
  available: boolean
}

@ObjectType()
export class GetFreeIpOfL3NetworkResult {
  @Field(() => [String], { nullable: true })
  ipv4List: string[]

  @Field(() => [String], { nullable: true })
  ipv6List: string[]
}

@ObjectType()
export class LinkResourceOfIpRange {
  @Field(() => Int, { nullable: true })
  vm: number

  @Field(() => Int, { nullable: true })
  vrouter: number
}

@ObjectType()
export class IpRange {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  ipRangeType: string

  @Field(() => IpCapacity, { description: 'ip可用量', nullable: true })
  ipCapacity: IpCapacity

  @Field(() => String, { nullable: true })
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  gateway: string

  @Field(() => String, { nullable: true })
  netmask: string

  @Field(() => String, { nullable: true })
  networkCidr: string

  @Field(() => String, { nullable: true })
  prefixLen: string

  @Field(() => String, { nullable: true })
  addressMode: string

  @Field(() => String, { nullable: true })
  startIp: string

  @Field(() => String, { nullable: true })
  endIp: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => Int, { nullable: true })
  ipVersion: 4 | 6 | 46

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => LinkResourceOfIpRange, { nullable: true })
  linkResource?: LinkResourceOfIpRange
}

@ObjectType()
export class IpRangeListResp {
  @Field(() => [IpRange])
  list: IpRange[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class IpRangeCountResp {
  @Field(() => Int)
  ipv4Num: number

  @Field(() => Int)
  ipv6Num?: number
}

@InputType()
export class AddIpRangeParams {
  @Field(() => String)
  name: string

  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => Int, { nullable: true })
  prefixLen?: number

  @Field(() => String, { nullable: true })
  addressMode?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  startIp: string

  @Field(() => String)
  endIp: string

  @Field(() => String)
  gateway: string

  @Field(() => String, { nullable: true })
  ipRangeType?: string

  @Field(() => Int)
  ipVersion: 4 | 6 | 46

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => [String], { nullable: true })
  tagUuids?: any[]

  @Field(() => [String], { nullable: true })
  systemTags?: any[]

  @Field(() => [String], { nullable: true })
  userTags?: any[]
}

@InputType()
export class AddIpRangeByNetworkCidrParams {
  @Field(() => String)
  name: string

  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  networkCidr: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  ipRangeType?: string

  @Field(() => Int)
  ipVersion: 4 | 6 | 46

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => [String], { nullable: true })
  tagUuids?: any[]

  @Field(() => [String], { nullable: true })
  systemTags?: any[]

  @Field(() => [String], { nullable: true })
  userTags?: any[]
}

@ObjectType()
export class IP {
  @Field(() => String, { nullable: true })
  ipRangeUuid?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => String, { nullable: true })
  gateway?: string
}

@InputType()
export class GetFreeIpOfL3NetworkParam {
  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  ipRangeUuid?: string

  @Field(() => String, { nullable: true })
  start?: string

  @Field(() => String, { nullable: true })
  ipRangeType?: string

  @Field(() => Int, { nullable: true })
  limit?: number
}

@ArgsType()
export class GetL3NetworkIpStatisticParam {
  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  sortBy?: string

  @Field(() => String, { nullable: true })
  sortDirection?: string

  @Field(() => Int, { nullable: true })
  limit?: number

  @Field(() => Int, { nullable: true })
  start?: number

  @Field(() => Boolean, { nullable: true })
  replyWithCount?: boolean
}

@InputType()
export class CheckIpAvailabilityParam {
  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String)
  ip: string

  @Field(() => Boolean, { nullable: true })
  arpCheck?: boolean

  @Field(() => Boolean, { nullable: true })
  ipRangeCheck?: boolean
}

@InputType()
export class GetFreeIpInput {
  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  ipRangeUuid?: string

  @Field(() => String, { nullable: true })
  ipRangeType?: string

  @Field(() => Int, { nullable: true })
  ipVersion?: 4 | 6 | 46
}
