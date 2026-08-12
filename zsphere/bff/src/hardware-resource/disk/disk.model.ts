import { ObjectType, Field, ArgsType, registerEnumType, Int, Float } from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'

export enum ReadyState {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Rebuilding = 'Rebuilding',
  LostConnect = 'LostConnect'
}
registerEnumType(ReadyState, {
  name: 'ReadyState'
})

export enum DiskReadyState {
  Normal = 'Normal',
  Abnormal = 'Abnormal',
  Rebuilding = 'Rebuilding',
  Offline = 'Offline',
  Unknown = 'Unknown'
}
registerEnumType(DiskReadyState, {
  name: 'DiskReadyState'
})

export enum DiskUsage {
  SystemDisk = 'SystemDisk',
  CacheDisk = 'CacheDisk',
  DataDisk = 'DataDisk'
}
registerEnumType(DiskUsage, {
  name: 'DiskUsage'
})

@ObjectType()
export class Disk {
  @Field(() => String)
  uuid?: string

  @Field(() => String)
  slotNumber?: string

  @Field(() => DiskUsage, { nullable: true })
  diskUsage?: DiskUsage

  @Field(() => String, { nullable: true })
  diskType?: string

  @Field(() => Float, { nullable: true })
  size?: number

  @Field(() => DiskReadyState, { nullable: true })
  readyState?: DiskReadyState

  @Field(() => String, { nullable: true })
  ssdRemainingLife?: string

  @Field(() => Int, { nullable: true })
  temperature?: number

  @Field(() => Int, { nullable: true })
  rotateSpeed?: number

  @Field(() => String, { nullable: true })
  locateStatus?: string

  @Field(() => String, { nullable: true })
  driveType?: string

  @Field(() => String, { nullable: true })
  model?: string
}

@ArgsType()
export class QueryDiskArgs extends QueryAction {}

@ObjectType()
export class QueryDiskResp extends QueryCommonResponse(Disk) {}

@ObjectType()
export class HostBlockDevices {
  @Field(() => String)
  name: string

  @Field(() => Boolean, { nullable: true })
  smartPassed?: boolean

  @Field(() => String, { nullable: true })
  model?: string

  @Field(() => String, { nullable: true })
  mediaType?: string

  @Field(() => String, { nullable: true })
  serialNumber?: string

  @Field(() => BigInt)
  size: number

  @Field(() => BigInt, { nullable: true })
  used?: number

  @Field(() => BigInt, { nullable: true })
  available?: number

  @Field(() => Int, { nullable: true })
  usedRatio?: number

  @Field(() => String, { nullable: true })
  fsType?: string

  @Field(() => String, { nullable: true })
  mountPoint?: string

  @Field(() => [HostBlockDevices], { nullable: true })
  children?: HostBlockDevices[]
}

@ArgsType()
export class QueryHostBlockDevicesArgs extends QueryAction {}

@ObjectType()
export class QueryHostBlockDevicesResp extends QueryCommonResponse(HostBlockDevices) {}
