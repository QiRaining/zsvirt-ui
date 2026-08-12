import { ArgsType, Field, Int, ObjectType, OmitType } from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { BackupStorageState, BackupStorageStatus } from '@/common/enum'
import { GetMetricDataListArgs, MetricData } from '@/common/metric-data/metric-data.model'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { SystemTag } from '@/zsphere-administration/tag/tag.model'

// @ObjectType()
// export class AttachedZoneUuids {
//   @Field(() => String)
//   uuid: string
// }

@ObjectType()
export class RemoteBackupStorage {
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

  @Field(() => String, { nullable: true })
  tag?: string
}

@ObjectType()
export class RemoteBackupStorageQueryResp {
  @Field(() => [RemoteBackupStorage], { nullable: true })
  list?: RemoteBackupStorage[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryRemoteBackupStorageArgs extends QueryAction {}

@ArgsType()
export class GetRemoteBackupStorageMetricDataListArgs extends OmitType(GetMetricDataListArgs, [
  'namespace',
  'metricList'
]) {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  metricNames: string[]
}

@ArgsType()
export class QueryRemoteBackupStorageSystemTagsArgs extends QueryAction {}

@ObjectType()
export class RemoteBackupStorageSystemTagsQueryResp {
  @Field(() => [SystemTag], { nullable: true })
  list?: SystemTag[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
@ObjectType()
export class RemoteBackupStorageMetricData extends MetricData {}
