import {
  ArgsType,
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType
} from '@nestjs/graphql'

import { QueryCommonResponse, QueryAction, Condition } from '@/common/model/action-query.model'
import { BackupStorage } from '@/hardware-resource/backup-storage/backup-storage.model'
import { BackupStorageRef } from '@/zsphere-resource/image/image.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

export enum BackupResourceType {
  Group = 'Group',
  VmInstance = 'VmInstance',
  Volume = 'Volume',
  Database = 'Database',
  // 云主机详情页面
  ForVmInstanceDetail = 'ForVmInstanceDetail',
  ForVolumeDetail = 'ForVolumeDetail'
}

registerEnumType(BackupResourceType, {
  name: 'BackupResourceType'
})

export enum BackupResourceFullBackupType {
  Full = 'Full',
  Incremental = 'Incremental'
}

registerEnumType(BackupResourceFullBackupType, {
  name: 'BackupResourceFullBackupType'
})

export enum BackupResourceVmBackupType {
  Include = 'Include',
  NotInclude = 'NotInclude'
}

registerEnumType(BackupResourceVmBackupType, {
  name: 'BackupResourceVmBackupType'
})

export enum BackupDataIsRemoteSynced {
  Yes = 'Yes',
  No = 'No'
}

registerEnumType(BackupDataIsRemoteSynced, {
  name: 'BackupDataIsRemoteSynced'
})

export enum BackupDataIsLocalSynced {
  Yes = 'Yes',
  No = 'No'
}

registerEnumType(BackupDataIsLocalSynced, {
  name: 'BackupDataIsLocalSynced'
})

export enum BackupDataCanSync {
  Yes = 'Yes',
  No = 'No'
}

registerEnumType(BackupDataCanSync, {
  name: 'BackupDataCanSync'
})

@ArgsType()
export class QueryVolumeBackupArgs extends QueryAction {
  @Field(() => BackupResourceType, {
    nullable: true
  })
  declare type?: BackupResourceType
}

export enum VolumeBackupDataSummaryQueryType {
  VmInstance = 'VmInstance',
  Volume = 'Volume'
}

registerEnumType(VolumeBackupDataSummaryQueryType, {
  name: 'VolumeBackupDataSummaryQueryType'
})

@ArgsType()
export class VolumeBackupDataSummaryArgs {
  @Field(() => [Condition], { nullable: true, defaultValue: [] })
  conditions?: Condition[]

  @Field(() => VolumeBackupDataSummaryQueryType)
  type: VolumeBackupDataSummaryQueryType

  @Field(() => String, {
    description: '资源UUID，只能是volumeUuid或vmInstanceUuid'
  })
  resourceUuid: string
}

@ObjectType()
export class VolumeBackupDataSummary {
  @Field(() => String, {
    description: '资源UUID，只能是volumeUuid或vmInstanceUuid'
  })
  resourceUuid: string

  @Field(() => Float, { nullable: true, defaultValue: 0, description: '全量' })
  full?: number

  @Field(() => Float, { nullable: true, defaultValue: 0, description: '增量' })
  incremental?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '增量依赖'
  })
  incrementalDependency?: number
}

@ArgsType()
export class QueryBackupResourceArgs extends QueryAction {
  @Field(() => BackupResourceType, {
    nullable: true
  })
  declare type?: BackupResourceType

  @Field(() => String, { defaultValue: 'size' })
  declare sortBy?: 'size' | 'count'
}

@ArgsType()
export class ThinProvisionByPrimaryStorageArgs {
  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => String, { nullable: true })
  primaryStorageType?: string
}

@ObjectType()
export class BackupResourceData {
  @Field(() => String, {
    description:
      '以资源为视角的时候，该UUID可能不止一个，所以这里用资源UUid(volumeUuid或者vmInstanceUuid) —— 等待有缘人'
  })
  uuid: string

  @Field(() => String, {
    nullable: true,
    description:
      'CdpTask 会导致一个VM可能有多个Root Volume, 当以vm为视角的时候只展示第一个volumeUuid'
  })
  volumeUuid: string

  @Field(() => String, {
    nullable: true,
    description: '云主机备份应该用此UUID'
  })
  vmInstanceUuid?: string

  @Field(() => [String], {
    nullable: true,
    defaultValue: [],
    description: '对应上面的UUID/volumeUuid，上面UUIDvolumeUuid定义不合理，真实情况应该是一个数组。'
  })
  volumeBackupUuids?: string[]

  @Field(() => String, {
    nullable: true,
    description: '资源名称, 备份类型为Root的时候取云主机名称，备份类型为Data的时候直接取name'
  })
  name?: string

  @Field(() => Float, {
    description: '备份数量, 以size查询的时候该字段为0。',
    nullable: true,
    defaultValue: 0
  })
  count?: number

  @Field(() => Float, {
    description: '根云盘备份文件总大小，以count查询的时候该字段为0。',
    nullable: true,
    defaultValue: 0
  })
  size?: number

  @Field(() => VmInstance, { nullable: true })
  vmInstance?: VmInstance
}

@ObjectType()
export class BackupDatabase {
  @Field(() => String)
  uuid: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => BackupStorage, { nullable: true, description: '本地备份服务器' })
  localBackupStorage?: BackupStorage

  @Field(() => BackupStorage, { nullable: true, description: '远端备份服务器' })
  remoteBackupStorage?: BackupStorage

  @Field(() => Boolean, {
    nullable: true,
    description:
      '能否同步到远端备份服务器，根据本地备份数据信息查询（如果没有本地备份数据，那也没法同步到远端）'
  })
  canSyncToRemote: boolean

  @Field(() => String, { nullable: true })
  md5?: string

  @Field(() => String, { nullable: true })
  version?: string

  @Field(() => Float, { nullable: true, description: '备份容量' })
  size: number

  @Field(() => String, { description: '创建时间', nullable: true })
  createDate: string

  @Field(() => [BackupStorageRef], {
    description: '备份服务器关联',
    nullable: true
  })
  backupStorageRefs: BackupStorageRef[]
}

@ObjectType()
export class BackupData {
  @Field(() => String, {
    description: '资源的UUID，唯一标示该资源'
  })
  uuid: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => Boolean, {
    nullable: true,
    description:
      '能否同步到远端备份服务器，根据本地备份数据信息查询（如果没有本地备份数据，那也没法同步到远端）'
  })
  canSyncToRemote: boolean

  @Field(() => [String], { nullable: true })
  vmSystemTags: string[]

  @Field(() => String, { nullable: true })
  metadata: string

  @Field(() => String, { nullable: true })
  vmDescription: string

  @Field(() => String, { nullable: true })
  metadataName: string

  @Field(() => String, { nullable: true })
  metadataDescription: string

  @Field(() => String, { nullable: true })
  volumeUuid: string

  @Field(() => String, {
    nullable: true,
    description: '云主机备份应该用此UUID'
  })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  groupUuid: string

  @Field(() => String, { nullable: true })
  state: string

  @Field(() => String, {
    description: '备份数据类型: Root | Data',
    nullable: true
  })
  type: string

  @Field(() => BackupStorage, { nullable: true, description: '本地备份服务器' })
  localBackupStorage?: BackupStorage

  @Field(() => BackupStorage, { nullable: true, description: '远端备份服务器' })
  remoteBackupStorage?: BackupStorage

  @Field(() => [BackupStorageRef], {
    description: '备份服务器关联',
    nullable: true
  })
  backupStorageRefs: BackupStorageRef[]

  @Field(() => Boolean, { description: '包含数据云盘', nullable: true })
  hasDataVolume: boolean

  @Field(() => Float, {
    description: '包含备份数据的云主机或者云盘大小',
    nullable: true
  })
  size: number

  @Field(() => Float, {
    description: '当前备份数据的容量大小，其值等于后端返回的 size，而非 metadata 里的 size',
    nullable: true
  })
  backupDataSize?: number

  @Field(() => BackupResourceVmBackupType, {
    nullable: true,
    description: '云主机是否包含数据云盘'
  })
  isIncludeDataVolume: BackupResourceVmBackupType

  @Field(() => String, { description: '备份类型', nullable: true })
  mode: string

  @Field(() => String, { nullable: true, description: '挂载云主机名字' })
  attachedVmName: string

  @Field(() => BackupResourceFullBackupType, { nullable: true })
  backupType: BackupResourceFullBackupType

  @Field(() => String, { description: '创建时间', nullable: true })
  createDate: string

  @Field(() => String, { description: '最后一次修改时间', nullable: true })
  lastOpDate: string

  @Field(() => Boolean, { nullable: true })
  rootAndData: boolean

  @Field(() => String, { nullable: true })
  format: string

  @Field(() => Boolean, { nullable: true })
  isShareable: boolean

  @Field(() => Boolean, { nullable: true })
  dataVolumeAllExisted: boolean

  @Field(() => Boolean, { nullable: true })
  lostData: boolean

  @Field(() => String, { description: '磁盘带宽', nullable: true })
  volumeBandWidth: string

  @Field(() => Boolean, { nullable: true })
  isVirtioSCSI: boolean

  @Field(() => String, { nullable: true })
  wwn: string

  @Field(() => String, { nullable: true })
  platform: string

  @Field(() => Int, { nullable: true })
  cpuNum: number

  @Field(() => Float, { nullable: true })
  memorySize: number

  @Field(() => Float, { description: '真实容量', nullable: true })
  actualSize: number

  @Field(() => String, { nullable: true })
  defaultL3NetworkUuid?: string

  @Field(() => [String], { defaultValue: [], nullable: true })
  dataVolumeUuids?: string[]

  @Field(() => [BackupData], { nullable: true })
  dataVolumeBackup?: BackupData[]

  @Field(() => Boolean, { nullable: true })
  isLocalLatest?: boolean

  @Field(() => Boolean, { nullable: true })
  isRemoteLatest?: boolean
}

@ObjectType()
export class BackupDataResponse extends QueryCommonResponse(BackupData) {}
@ObjectType()
export class BackupDatabaseResponse extends QueryCommonResponse(BackupDatabase) {}

@ObjectType()
export class BackupResourceDataResponse extends QueryCommonResponse(BackupResourceData) {}

@InputType()
export class CreateVmFromVmBackupInput {
  @Field(() => String, { nullable: true })
  groupUuid?: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { description: '网络', nullable: true })
  l3NetworkUuids: string[]

  @Field(() => String, { description: '默认网络', nullable: true })
  defaultL3NetworkUuid?: string

  @Field(() => String, { description: '计算规格UUID', nullable: true })
  instanceOfferingUuid: string

  @Field(() => String, { description: '物理机UUID', nullable: true })
  hostUuid: string

  @Field(() => String, { description: '根云盘所在主存储UUID', nullable: true })
  primaryStorageUuidForRootVolume?: string

  @Field(() => String, {
    description: '数据云盘所在主存储UUID',
    nullable: true
  })
  primaryStorageUuidForDataVolume: string

  @Field(() => String, { description: '镜像UUID', nullable: true })
  imageUuid: string

  @Field(() => [String], { nullable: true })
  systemTags: string[]

  @Field(() => String, { description: '备份数据UUID', nullable: true })
  backupUuid: string

  @Field(() => String, { description: '备份服务器', nullable: true })
  backupStorageUuid?: string

  @Field(() => String, { description: '镜像平台类型', nullable: true })
  platform: string
}

@InputType()
export class CreateRootVolumeTemplateFromVolumeBackupInput {
  @Field(() => String, { nullable: true })
  backupUuid?: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => String, { description: '备份服务器', nullable: true })
  backupStorageUuid?: string

  @Field(() => String, { description: '镜像平台类型', nullable: true })
  platform: string
}

export enum BackupPolicyType {
  New,
  Overlap
}

registerEnumType(BackupPolicyType, {
  name: 'BackupPolicyType'
})

export enum BackupProvisionType {
  ThickProvision,
  ThinProvision
}

registerEnumType(BackupProvisionType, {
  name: 'BackupProvisionType'
})

@ObjectType()
export class BackupTaskStatusData {
  @Field(() => String)
  targetResourceUuid?: string

  @Field(() => [String], { nullable: true })
  longJobUuids?: string[]
}

@ObjectType()
export class BackupTaskStatus {
  @Field(() => Float)
  progress?: number

  @Field(() => Boolean)
  isTaskRunning?: boolean

  @Field(() => [BackupTaskStatusData], { nullable: true })
  backupTaskStatusData?: BackupTaskStatusData[]
}
