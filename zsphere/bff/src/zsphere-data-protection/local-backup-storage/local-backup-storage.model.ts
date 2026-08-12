import { ArgsType, Field, Int, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { BackupStorageState, BackupStorageStatus } from '@/common/enum'
import { GetMetricDataListArgs, MetricData } from '@/common/metric-data/metric-data.model'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
// @ObjectType()
// export class AttachedZoneUuids {
//   @Field(() => String)
//   uuid: string
// }

export enum LocalBackupStorageQueryType {
  Normal = 'Normal',
  QueryForCdpTaskResource = 'QueryForCdpTaskResource'
}
registerEnumType(LocalBackupStorageQueryType, {
  name: 'LocalBackupStorageQueryType'
})

@ObjectType()
export class LocalBackupStorage {
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
}

@ObjectType()
export class LocalBackupStorageSystemTags {
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
export class LocalBackupStorageQueryResp {
  @Field(() => [LocalBackupStorage], { nullable: true })
  list?: LocalBackupStorage[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError

  type?: LocalBackupStorageQueryType
}

@ObjectType()
export class LocalBackupStorageOfCdpTaskSummary {
  @Field(() => Int, { nullable: true })
  total: number
}

@ObjectType()
export class LocalBackupStorageOfBackupJobSummary {
  @Field(() => Int, { nullable: true })
  total: number
}

@ObjectType()
export class ScanLocalBackupStorage {
  @Field(() => Int, { nullable: true })
  vmTotal?: number

  @Field(() => Int, { nullable: true })
  volumeTotal?: number

  @Field(() => Int, { nullable: true })
  dataBaseTotal?: number
}
@ObjectType()
export class LocalBackupStorageSystemTagsQueryResp {
  @Field(() => [LocalBackupStorageSystemTags], { nullable: true })
  list?: LocalBackupStorageSystemTags[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryLocalBackupStorageArgs extends QueryAction {
  @Field(() => LocalBackupStorageQueryType, { nullable: true })
  declare type?: LocalBackupStorageQueryType
}

@ArgsType()
export class QueryLocalBackupSystemTagsArgs extends QueryAction {}

@ArgsType()
export class GetLocalBackupStorageMetricDataListArgs extends OmitType(GetMetricDataListArgs, [
  'namespace',
  'metricList'
]) {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  metricNames: string[]
}

@ObjectType()
export class LocalBackupStorageMetricData extends MetricData {}
