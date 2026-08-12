import { Field, Int, ObjectType } from '@nestjs/graphql'

import { HostKernelInterface } from '@/hardware-resource/host-kernel-interface/host-kernel-interface.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

@ObjectType()
export class IpStatistics {
  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  vipUuid?: string

  @Field(() => String, { nullable: true })
  vipName?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  applianceVmOwnerUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceName?: string

  @Field(() => String, { nullable: true })
  vmInstanceType?: string

  @Field(() => String, { nullable: true })
  vmDefaultIp?: string

  @Field(() => String, { nullable: true })
  resourceOwnerUuid?: string

  @Field(() => HostKernelInterface, { nullable: true })
  hostKernelInterface?: HostKernelInterface

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  useFor?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  ownerName?: string

  @Field(() => [String], { nullable: true })
  resourceTypes?: string[]

  @Field(() => VmInstance, { nullable: true })
  vmInstance?: VmInstance

  @Field(() => VmInstance, { nullable: true })
  templatedVmInstance?: VmInstance
}

@ObjectType()
export class IError {
  @Field(() => String, { nullable: true })
  code?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  details?: string

  @Field(() => Int, { nullable: true })
  cause?: number
}

@ObjectType()
export class GetL3NetworkIpStatisticResult {
  @Field(() => [IpStatistics], { nullable: true })
  list?: IpStatistics[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => IError, { nullable: true })
  error?: IError
}
