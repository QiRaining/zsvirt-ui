import { Field, Int, InputType, ObjectType, Float, registerEnumType } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
export enum AllocatorStrategyType {
  LeastVmPreferredHostAllocatorStrategy = 'LeastVmPreferredHostAllocatorStrategy',
  MinimumCPUUsageHostAllocatorStrategy = 'MinimumCPUUsageHostAllocatorStrategy',
  MinimumMemoryUsageHostAllocatorStrategy = 'MinimumMemoryUsageHostAllocatorStrategy',
  MaxInstancePerHostHostAllocatorStrategy = 'MaxInstancePerHostHostAllocatorStrategy',
  LastHostPreferredAllocatorStrategy = 'LastHostPreferredAllocatorStrategy',
  DefaultHostAllocatorStrategy = 'DefaultHostAllocatorStrategy'
}
export enum StrategyPatternType {
  Hard = 'hard',
  Soft = 'soft'
}
registerEnumType(AllocatorStrategyType, {
  name: 'AllocatorStrategyType'
})

@InputType()
export class CreateInstanceOfferingInput {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Int)
  cpuNum: number

  @Field(() => Float)
  memorySize: number

  @Field(() => Int, { nullable: true })
  maxNum?: number

  @Field(() => String, { nullable: true })
  strategyPattern?: string

  @Field(() => AllocatorStrategyType, { nullable: true })
  allocatorStrategy?: AllocatorStrategyType

  @Field(() => String, { nullable: true })
  volumeTotalBandwidth: string

  @Field(() => String, { nullable: true })
  volumeReadBandwidth: string

  @Field(() => String, { nullable: true })
  volumeWriteBandwidth: string

  @Field(() => String, { nullable: true })
  volumeTotalIops: string

  @Field(() => String, { nullable: true })
  volumeReadIops: string

  @Field(() => String, { nullable: true })
  volumeWriteIops: string

  @Field(() => String, { nullable: true })
  instanceOfferingUserConfig: string

  @Field(() => String, { nullable: true })
  networkOutboundBandwidth: string

  @Field(() => String, { nullable: true })
  networkInboundBandwidth: string
}

@InputType()
export class ShareInstanceOfferingToPublicInput {
  @Field(() => [String])
  resourceUuids: string[]
}
@ObjectType()
export class ValidatInstanceOfferingUserConfigResp {
  @Field(() => Boolean)
  valid: boolean

  @Field(() => String, { nullable: true, description: '错误内容' })
  error?: string
}
@InputType()
export class RevokeInstanceOfferingSharingFromPublicInput {
  @Field(() => [String])
  resourceUuids: string[]
}
@ObjectType()
export class InstanceOfferingSystemTags {
  @Field(() => String, { nullable: true })
  volumeTotalBandwidth: string

  @Field(() => String, { nullable: true })
  volumeReadBandwidth: string

  @Field(() => String, { nullable: true })
  volumeWriteBandwidth: string

  @Field(() => String, { nullable: true })
  networkOutboundBandwidth: string

  @Field(() => String, { nullable: true })
  networkInboundBandwidth: string

  @Field(() => String, { nullable: true })
  volumeTotalIops: string

  @Field(() => String, { nullable: true })
  volumeReadIops: string

  @Field(() => String, { nullable: true })
  volumeWriteIops: string

  @Field(() => String, { nullable: true })
  instanceOfferingUserConfig: string

  @Field(() => String, { nullable: true })
  maxInstancePerHost: string

  @Field(() => String, { nullable: true })
  minimumCPUUsageHostAllocatorStrategyMode: string

  @Field(() => String, { nullable: true })
  minimumMemoryUsageHostAllocatorStrategyMode: string
}
@ObjectType()
export class InstanceOffering {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Int)
  cpuNum: number

  @Field(() => Int, { nullable: true })
  cpuSpeed?: number

  @Field(() => Float)
  memorySize: number

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => AllocatorStrategyType)
  allocatorStrategy: AllocatorStrategyType

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Int, { nullable: true })
  sortKey?: number

  @Field(() => String)
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String)
  state: string

  @Field(() => Boolean, { nullable: true })
  toPublic?: boolean

  @Field(() => InstanceOfferingSystemTags, { nullable: true })
  systemTags?: InstanceOfferingSystemTags

  @Field(() => Float, { nullable: true, description: '内存预留大小' })
  reservedMemorySize?: number
}

@ObjectType()
export class InstanceOfferingQueryResp {
  @Field(() => [InstanceOffering], { nullable: true })
  list?: InstanceOffering[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class InstanceOfferingActionResp {
  @Field(() => InstanceOffering, { nullable: true })
  inventory?: InstanceOffering

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
