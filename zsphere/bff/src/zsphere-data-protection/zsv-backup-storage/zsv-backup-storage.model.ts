import { ArgsType, Field, Int, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { BackupStorageState, BackupStorageStatus } from '@/common/enum'
import { GetMetricDataListArgs, MetricData } from '@/common/metric-data/metric-data.model'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum ZSVBackupStorageQueryType {
  Normal = 'Normal'
}
registerEnumType(ZSVBackupStorageQueryType, {
  name: 'ZSVBackupStorageQueryType'
})

@ObjectType()
export class ZSVBackupStorage {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => BackupStorageState, { nullable: true })
  state?: BackupStorageState

  @Field(() => BackupStorageStatus, { nullable: true })
  status?: BackupStorageStatus

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  url?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => String, { nullable: true })
  cidr?: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => BigInt, { nullable: true })
  totalCapacity?: BigInt

  @Field(() => BigInt, { nullable: true })
  availableCapacity?: BigInt

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [String], { nullable: true })
  attachedZoneUuids?: string[]

  @Field(() => [String], { nullable: true })
  attachedZoneRefUuids?: string[]
}

@ObjectType()
export class ZSVBackupStorageSystemTags {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  tag?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  inherent?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class ZSVBackupStorageQueryResp {
  @Field(() => [ZSVBackupStorage], { nullable: true })
  list?: ZSVBackupStorage[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError

  type?: ZSVBackupStorageQueryType
}

@ObjectType()
export class ZSVBackupStorageOfCdpTaskSummary {
  @Field(() => Int, { nullable: true })
  total: number
}

@ObjectType()
export class ZSVBackupStorageOfBackupJobSummary {
  @Field(() => Int, { nullable: true })
  total: number
}

@ObjectType()
export class ScanZSVBackupStorage {
  @Field(() => Int, { nullable: true })
  vmTotal?: number

  @Field(() => Int, { nullable: true })
  volumeTotal?: number

  @Field(() => Int, { nullable: true })
  dataBaseTotal?: number
}

@ObjectType()
export class ZSVBackupStorageSystemTagsQueryResp {
  @Field(() => [ZSVBackupStorageSystemTags], { nullable: true })
  list?: ZSVBackupStorageSystemTags[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryZSVBackupStorageArgs extends QueryAction {
  @Field(() => ZSVBackupStorageQueryType, { nullable: true })
  declare type?: ZSVBackupStorageQueryType
}

@ArgsType()
export class QueryZSVBackupSystemTagsArgs extends QueryAction {}

@ArgsType()
export class GetZSVBackupStorageMetricDataListArgs extends OmitType(GetMetricDataListArgs, [
  'namespace',
  'metricList'
]) {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  metricNames: string[]
}

@ObjectType()
export class ZSVBackupStorageMetricData extends MetricData {}
