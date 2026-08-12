import { ObjectType, Field, ArgsType, Int } from '@nestjs/graphql'

import { QueryCommonResponse, QueryAction } from '@/common/model/action-query.model'

import { HardwareState } from '../host/host.model'

@ObjectType()
export class CPU {
  @Field(() => String, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  model?: string

  @Field(() => String, { nullable: true })
  GHz?: string

  @Field(() => String, { nullable: true })
  architecture?: string

  @Field(() => String, { nullable: true })
  logicKernel?: string

  @Field(() => String, { nullable: true })
  physicalCores?: string

  @Field(() => HardwareState, { nullable: true })
  state?: HardwareState

  @Field(() => String, { nullable: true })
  currentTemperature?: string

  @Field(() => String, { nullable: true })
  level1Cache?: string

  @Field(() => String, { nullable: true })
  level2Cache?: string

  @Field(() => String, { nullable: true })
  level3Cache?: string

  @Field(() => String)
  hostUuid: string
}

@ArgsType()
export class QueryCPUArgs {
  @Field(() => String)
  hostUuid: string
}

@ObjectType()
export class QueryCPUResp extends QueryCommonResponse(CPU) {}

@ObjectType()
export class HostPhysicalCpu {
  @Field(() => Int, { nullable: true })
  coreCount?: number

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  currentSpeed?: string

  @Field(() => String)
  hostUuid: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  serialNumber?: string

  @Field(() => String, { nullable: true })
  socketDesignation?: string

  @Field(() => Int, { nullable: true })
  threadCount?: number

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  version?: string
}

@ArgsType()
export class QueryHostPhysicalCpuArgs extends QueryAction {}

@ObjectType()
export class QueryHostPhysicalCpuResp extends QueryCommonResponse(HostPhysicalCpu) {}
