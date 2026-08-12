import {
  Int,
  Float,
  Field,
  ArgsType,
  ObjectType,
  registerEnumType,
  InputType
} from '@nestjs/graphql'

import { BackupStorageState, BackupStorageType } from '@/common/enum'
import { MetricData } from '@/common/metric-data/metric-data.model'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Zone } from '@/hardware-resource/zone/zone.model'

// export enum BackupStorageStateEvent {
//   enable = 'enable',
//   disable = 'disable'
// }
// registerEnumType(BackupStorageStateEvent, {
//   name: 'BackupStorageStateEvent'
// })

export enum BackupStorageQueryType {
  Normal = 'Normal',
  CreateImageCandidate = 'CreateImageCandidate',
  MigrateImageCandidate = 'MigrateImageCandidate',
  NotAttachedZoneBackupStorageList = 'NotAttachedZoneBackupStorageList'
}

registerEnumType(BackupStorageQueryType, {
  name: 'BackupStorageQueryType'
})

@ObjectType()
export class CephBackupStorageMon {
  @Field(() => String)
  hostname: string

  @Field(() => Int, { nullable: true })
  monPort?: number

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => String, { nullable: true })
  backupStorageUuid?: string

  @Field(() => String, { nullable: true })
  monAddr?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  sshUsername?: string

  @Field(() => String, { nullable: true })
  sshPassword?: string

  @Field(() => String, { nullable: true })
  monUuid?: string
}

@ObjectType()
export class BackupStorage {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => BackupStorageType, { nullable: true })
  type?: BackupStorageType

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => Float, { nullable: true })
  availableCapacity?: number

  @Field(() => Float, { nullable: true })
  totalCapacity?: number

  @Field(() => String)
  url: string

  @Field(() => BackupStorageState, { nullable: true })
  state: BackupStorageState

  @Field(() => String)
  status: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => [String], { nullable: true })
  attachedZoneUuids?: Array<string>

  @Field(() => Zone, { nullable: true })
  zone?: Zone

  @Field(() => [CephBackupStorageMon], { nullable: true })
  mons?: CephBackupStorageMon[]

  @Field(() => String, { nullable: true })
  fsid?: string

  @Field(() => String, { nullable: true })
  poolName?: string

  @Field(() => String, { nullable: true })
  dataNetwork?: string

  @Field(() => String, { nullable: true })
  syncImageNetwork?: string

  @Field(() => Float, { nullable: true })
  poolAvailableCapacity?: number

  @Field(() => Float, { nullable: true })
  poolUsedCapacity?: number

  @Field(() => Float, { nullable: true })
  poolReplicatedSize?: number

  @Field(() => String, { nullable: true })
  ossBucketUuid?: string

  @Field(() => [String], { defaultValue: [] })
  systemTag?: string[]

  @Field(() => Float, {
    nullable: true,
    description: '镜像服务器保留容量。category=backupStorage name=reservedCapacity。默认值是"1G"',
    defaultValue: 1073741824
  })
  reservedCapacity?: number
}

@ObjectType()
export class AddImageStoreBackupStorageResp {
  @Field(() => BackupStorage, { nullable: true })
  result?: BackupStorage

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class AddCephBackupStorageResp extends AddImageStoreBackupStorageResp {}

@ObjectType()
export class AddAliyunEBSBackupStorageResp extends AddImageStoreBackupStorageResp {}

@ObjectType()
export class BackupStorageActionResp {
  @Field(() => BackupStorage, { nullable: true })
  result?: BackupStorage

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class BackupStorageList {
  @Field(() => [BackupStorage])
  list: BackupStorage[]

  @Field(() => Int, { nullable: true })
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryBsArgs extends QueryAction {
  @Field(() => BackupStorageQueryType, { nullable: true })
  declare type?: BackupStorageQueryType
}

@ObjectType()
class Labels {
  @Field(() => String)
  BackupStorageUuid: string
}
@ObjectType()
export class BackupStorageMetricData extends MetricData {
  @Field(() => Labels)
  labels: Labels
}

@ObjectType()
export class BackupStorageSummary {
  @Field(() => Int, { nullable: true })
  total: number

  @Field(() => Int, { nullable: true })
  connecting: number

  @Field(() => Int, { nullable: true })
  connected: number

  @Field(() => Int, { nullable: true })
  disconnected: number

  @Field(() => Int, { nullable: true })
  other: number
}

@InputType()
export class CheckHostnameRepeatParam {
  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  hostname: string
}

@ObjectType()
export class CheckHostnameRepeatResult {
  @Field(() => Boolean)
  repeat: boolean
}

@ObjectType()
export class FreeHardDiskInfo {
  @Field(() => String)
  name: string

  @Field(() => String)
  type: string

  @Field(() => String)
  size: string

  @Field(() => String)
  physicalSector: string

  @Field(() => String)
  logicalSector: string

  @Field(() => Boolean)
  withPartition?: boolean

  @Field(() => String, { nullable: true, defaultValue: '' })
  partitionTable?: string

  @Field(() => String, { nullable: true, defaultValue: '-' })
  multipathDeviceName?: string
}

@ObjectType()
export class FreeHardDiskInfoList {
  @Field(() => [FreeHardDiskInfo], { defaultValue: [] })
  list: FreeHardDiskInfo[]

  @Field(() => Int)
  total: number
}
