import { ArgsType, Field, Float, Int, ObjectType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

@ArgsType()
export class CapacityManagementCardInput {
  @Field(() => String)
  zoneUuid: string
}

@ArgsType()
export class CapacityManagementCardPrimaryStorageInput {
  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  type: string
}

@ObjectType()
export class CapacityManagementSize {
  @Field(() => Float, { nullable: true })
  size: number
}

@ObjectType()
export class CapacityManagementFullSize {
  @Field(() => Float, { nullable: true })
  total?: number

  @Field(() => Float, { nullable: true })
  size: number
}

@ObjectType()
export class CapacityManagementActualSize {
  @Field(() => Float, { nullable: true })
  actualSize?: number

  @Field(() => Float, { nullable: true })
  size?: number
}

@ObjectType()
export class CapacityManagementFullActualSize {
  @Field(() => Float, { nullable: true })
  total: number

  @Field(() => Float, { nullable: true })
  actualSize: number

  @Field(() => Float, { nullable: true })
  size: number
}

@ObjectType()
export class CapacityManagementPrimaryStorageInfo {
  @Field(() => Int, { nullable: true })
  total: number

  @Field(() => Float, { nullable: true })
  usedCapacity: number

  @Field(() => Float, { nullable: true })
  usedPhysicalCapacity: number

  @Field(() => Float, { nullable: true })
  availableCapacity: number

  @Field(() => Float, { nullable: true })
  availablePhysicalCapacity: number

  @Field(() => Float, { nullable: true })
  totalCapacity: number

  @Field(() => Float, { nullable: true })
  totalPhysicalCapacity: number

  @Field(() => Float, { nullable: true })
  systemUsedCapacity: number
}

@ObjectType()
export class CapacityManagementVolumeTotalSizeInfo {
  @Field(() => CapacityManagementActualSize, { nullable: true })
  Root: CapacityManagementActualSize

  @Field(() => CapacityManagementActualSize, { nullable: true })
  Data: CapacityManagementActualSize
}

@ObjectType()
export class CapacityManagementCapacityInfo {
  @Field(() => Float, { nullable: true })
  totalCapacity?: number

  @Field(() => Float, { nullable: true })
  availableCapacity?: number

  @Field(() => Float, { nullable: true })
  usedCapacity?: number
}

@ObjectType()
export class CapacityManagementBackupStoreInfo {
  @Field(() => Float, { nullable: true })
  total: number

  @Field(() => Float, { nullable: true })
  totalCapacity: number

  @Field(() => Float, { nullable: true })
  availableCapacity: number

  @Field(() => Float, { nullable: true })
  usedCapacity: number

  @Field(() => CapacityManagementCapacityInfo, { nullable: true })
  ImageStoreBackupStorage: CapacityManagementCapacityInfo

  @Field(() => CapacityManagementCapacityInfo, { nullable: true })
  Ceph: CapacityManagementCapacityInfo
}

@ObjectType()
export class CapacityManagementSizeInBackupStoreInfo {
  @Field(() => CapacityManagementActualSize, { nullable: true })
  ImageStoreBackupStorage: CapacityManagementActualSize

  @Field(() => CapacityManagementActualSize, { nullable: true })
  Ceph: CapacityManagementActualSize
}

@ObjectType()
export class CapacityManagementComputeNodeInfo {
  @Field(() => Float, { nullable: true })
  zstackSize: number

  @Field(() => Float, { nullable: true })
  otherSize: number

  @Field(() => Float, { nullable: true })
  totalSize: number
}

@ObjectType()
export class CapacityManagementManagementNodeInfo {
  @Field(() => Float, { nullable: true })
  total: number

  @Field(() => Float, { nullable: true })
  used: number

  @Field(() => Float, { nullable: true })
  available: number

  @Field(() => Float, { nullable: true })
  log: number

  @Field(() => Float, { nullable: true })
  database: number

  @Field(() => Float, { nullable: true })
  databaseBackup: number

  @Field(() => Float, { nullable: true })
  monitor: number

  @Field(() => Float, { nullable: true })
  upgradeBackup: number
}

@ObjectType()
export class CapacityManagementCardPrimaryStorage {
  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => CapacityManagementPrimaryStorageInfo, {
    nullable: true,
    description:
      '主存储（Local/Ceph/SharedBlock）的存储信息 (总数、可用容量、可用物理容量、总容量、总物理容量)'
  })
  primaryStorageInfo?: CapacityManagementPrimaryStorageInfo

  @Field(() => CapacityManagementVolumeTotalSizeInfo, {
    nullable: true,
    description: '根盘/云盘的容量/真实容量统计信息'
  })
  volumeTotalSizeInfo?: CapacityManagementVolumeTotalSizeInfo

  @Field(() => CapacityManagementSize, {
    nullable: true,
    description: '镜像缓存大小'
  })
  imageCacheSizeInfo?: CapacityManagementSize

  @Field(() => CapacityManagementSize, {
    nullable: true,
    description: '主存储（Local/Ceph/SharedBlock）中的 Trash 大小'
  })
  primaryStorageTrashInfo?: CapacityManagementSize
}

@ObjectType()
export class CapacityManagementCard {
  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => CapacityManagementPrimaryStorageInfo, {
    nullable: true,
    description:
      '主存储（Local/Ceph/SharedBlock）的存储信息 (总数、可用容量、可用物理容量、总容量、总物理容量)'
  })
  primaryStorageInfo?: CapacityManagementPrimaryStorageInfo

  @Field(() => CapacityManagementVolumeTotalSizeInfo, {
    nullable: true,
    description: '根盘/云盘的容量/真实容量统计信息'
  })
  volumeTotalSizeInfo?: CapacityManagementVolumeTotalSizeInfo

  @Field(() => CapacityManagementSize, {
    nullable: true,
    description: '镜像缓存大小'
  })
  imageCacheSizeInfo?: CapacityManagementSize

  @Field(() => CapacityManagementSize, {
    nullable: true,
    description: '主存储（Local/Ceph/SharedBlock）中的 Trash 大小'
  })
  primaryStorageTrashInfo?: CapacityManagementSize

  @Field(() => CapacityManagementBackupStoreInfo, {
    nullable: true,
    description: '镜像服务器相关信息'
  })
  backupStoreInfo?: CapacityManagementBackupStoreInfo

  @Field(() => CapacityManagementSizeInBackupStoreInfo, {
    nullable: true,
    description: '获取镜像服务器中的镜像大小，按 ImageStore/Ceph 类型区分'
  })
  imageSizeInBackupStoreInfo?: CapacityManagementSizeInBackupStoreInfo

  @Field(() => CapacityManagementSize, {
    nullable: true,
    description: '获取镜像服务器中的备份相关数据的大小'
  })
  backupSizeInBackupStoreInfo?: CapacityManagementSize

  @Field(() => CapacityManagementSizeInBackupStoreInfo, {
    nullable: true,
    description: '获取镜像服务器中 Trash 大小，根据 ImageStore/Ceph 类型区分'
  })
  backupStoreTrashSizeInfo?: CapacityManagementSizeInBackupStoreInfo

  @Field(() => CapacityManagementFullActualSize, {
    nullable: true,
    description: '获取云主机（根盘）相关信息，总数、总大小、总实际大小'
  })
  vmInstanceInfo?: CapacityManagementFullActualSize

  @Field(() => CapacityManagementFullActualSize, {
    nullable: true,
    description: '获取云盘相关信息，总数、总大小、总实际大小'
  })
  dataVolumeInfo?: CapacityManagementFullActualSize

  @Field(() => CapacityManagementFullActualSize, {
    nullable: true,
    description: '获取镜像相关信息，总数、总大小、总实际大小'
  })
  imageInfo?: CapacityManagementFullActualSize

  @Field(() => CapacityManagementFullSize, {
    nullable: true,
    description: '获取快照相关信息，总数、总大小'
  })
  snapshotInfo?: CapacityManagementFullSize

  @Field(() => CapacityManagementComputeNodeInfo, {
    nullable: true,
    description: '获取计算节点相关信息，zstack 占用大小、总大小'
  })
  computeNodeInfo?: CapacityManagementComputeNodeInfo

  @Field(() => CapacityManagementManagementNodeInfo, {
    nullable: true,
    description:
      '获取管理节点信息，总容量、总已用、管理节点日志、数据库、数据库备份、监控、升级备份大小'
  })
  managementNodeInfo?: CapacityManagementManagementNodeInfo
}

// Top List

@ArgsType()
export class CapacityManagementTopListInput {
  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  sortBy: string

  @Field(() => String)
  sortDirection: string
}

// Host
@ObjectType()
export class CapacityManagementTopListHostDetail {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => Float, { nullable: true })
  usedCapacityPercentage?: number

  @Field(() => Float, { nullable: true })
  usedCapacity?: number

  @Field(() => Float, { nullable: true })
  freeCapacity?: number
}

@ObjectType()
export class CapacityManagementTopListHost {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Float, { nullable: true })
  usedRate?: number

  @Field(() => Float, { nullable: true })
  usedCapacity?: number

  @Field(() => Float, { nullable: true })
  availableCapacity?: number

  @Field(() => Float, { nullable: true })
  totalCapacity?: number

  @Field(() => Float, { nullable: true, description: '根分区已用量' })
  rootMountPointUsed?: number

  @Field(() => CapacityManagementTopListHostDetail, { nullable: true })
  detail: CapacityManagementTopListHostDetail
}

@ArgsType()
export class CapacityManagementTopListHostDiskInfoInput {
  @Field(() => String)
  uuid: string
}

@ObjectType()
export class CapacityManagementTopListHostDiskInfo {
  @Field(() => String, { nullable: true })
  key: string

  @Field(() => String, { nullable: true })
  diskDeviceLetter?: string

  @Field(() => String, { nullable: true })
  mountPoint?: string

  @Field(() => String, { nullable: true })
  fSType?: string

  @Field(() => Float, { nullable: true })
  free?: number

  @Field(() => Float, { nullable: true })
  used?: number

  @Field(() => Float, { nullable: true })
  total?: number

  @Field(() => Float, { nullable: true })
  percent?: number
}

// Primary Storage
@ObjectType()
export class CapacityManagementTopListPrimaryStorageDetail {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => Float, { nullable: true })
  totalPhysicalCapacity: number

  @Field(() => Float, { nullable: true })
  availablePhysicalCapacity: number

  @Field(() => Float, { nullable: true })
  usedPhysicalCapacity: number

  @Field(() => Float, { nullable: true })
  usedPhysicalCapacityPercentage: number

  @Field(() => Float, { nullable: true })
  rootVolumeSize?: number

  @Field(() => Float, { nullable: true })
  dataVolumeSize?: number

  @Field(() => Float, { nullable: true })
  imageCacheSize?: number

  @Field(() => Float, { nullable: true })
  trashSize?: number

  @Field(() => Float, { nullable: true })
  systemSize?: number
}

@ObjectType()
export class CapacityManagementTopListPrimaryStorage {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => CapacityManagementTopListPrimaryStorageDetail, {
    nullable: true
  })
  detail: CapacityManagementTopListPrimaryStorageDetail
}

// BackupStorage
@ObjectType()
export class CapacityManagementTopListBackupStorageDetail {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => Float, { nullable: true })
  totalCapacity: number

  @Field(() => Float, { nullable: true })
  availableCapacity: number

  @Field(() => Float, { nullable: true })
  usedCapacity: number

  @Field(() => Float, { nullable: true })
  usedCapacityPercentage: number

  @Field(() => Float, { nullable: true })
  imageSize: number

  @Field(() => Float, { nullable: true })
  backupSize: number

  @Field(() => Float, { nullable: true })
  trashSize: number
}

@ObjectType()
export class CapacityManagementTopListBackupStorage {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => CapacityManagementTopListBackupStorageDetail, {
    nullable: true
  })
  detail: CapacityManagementTopListBackupStorageDetail
}

// Image
@ObjectType()
export class CapacityManagementTopListImage {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Float, { nullable: true })
  actualSize?: number

  @Field(() => Float, { nullable: true })
  size?: number

  @Field(() => Boolean, { nullable: true })
  system?: boolean
}

// Image

@ObjectType()
export class CapacityManagementTopListVmInstance {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Float, { nullable: true })
  actualSize?: number

  @Field(() => Float, { nullable: true })
  size?: number
}

@ObjectType()
export class CapacityManagementTopListVolume {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Float, { nullable: true })
  actualSize?: number

  @Field(() => Float, { nullable: true })
  size?: number
}

@ObjectType()
export class CapacityManagementTopListSnapshotResource {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  resourceUuid: string

  @Field(() => String, { nullable: true })
  resourceName: string

  @Field(() => String, { nullable: true })
  resourceType: string
}

@ObjectType()
export class CapacityManagementTopListSnapshot {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Float, { nullable: true })
  size?: number

  @Field(() => String, { nullable: true })
  volumeUuid?: string

  @Field(() => String, { nullable: true })
  volumeType?: string

  @Field(() => CapacityManagementTopListSnapshotResource, { nullable: true })
  resource?: CapacityManagementTopListSnapshotResource
}

@ObjectType()
export class CapacityManagementDisconnectedResourceCount {
  @Field(() => Float, { nullable: true })
  host?: number

  @Field(() => Float, { nullable: true })
  primaryStorage?: number

  @Field(() => Float, { nullable: true })
  backupStorage?: number

  @Field(() => Float, { nullable: true })
  primaryStorageNotInCluster?: number

  @Field(() => Float, { nullable: true })
  total?: number
}

@ObjectType()
export class CapacityManagementListVMDiskInfo {
  @Field(() => String, { nullable: true })
  key: string

  @Field(() => String, { nullable: true })
  diskDeviceLetter?: string

  @Field(() => String, { nullable: true })
  mountPoint?: string

  @Field(() => String, { nullable: true })
  fSType?: string

  @Field(() => Float, { nullable: true })
  free?: number

  @Field(() => Float, { nullable: true })
  used?: number

  @Field(() => Float, { nullable: true })
  total?: number

  @Field(() => Float, { nullable: true })
  percent?: number
}

@ObjectType()
export class CapacityManagementListVMDiskInfoList extends QueryCommonResponse(
  CapacityManagementListVMDiskInfo
) {}
