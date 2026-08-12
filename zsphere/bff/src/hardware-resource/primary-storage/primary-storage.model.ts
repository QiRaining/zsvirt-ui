import {
  ArgsType,
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType
} from '@nestjs/graphql'

import {
  PrimaryStorageState,
  PrimaryStorageStatus,
  PrimaryStorageType,
  TrashType
} from '@/common/enum'
import { MetricData } from '@/common/metric-data/metric-data.model'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { CephPrimaryStoragePool } from '@/hardware-resource/ceph-primary-storage-pool/ceph-primary-storage-pool.model'
import { ExternalPrimaryStoragePool } from '@/hardware-resource/external-primary-storage-pool/external-primary-storage-pool.model'
import { Zone } from '@/hardware-resource/zone/zone.model'
import {
  LocalStorageHostCapacity,
  PrimaryStorageCapacity
} from '@/maintenance/capacity-calculation/capacity-calculation.model'
import { ResourceWithAttributes } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.model'

export enum PrimaryStorageTypeParam {
  LocalStorage = 'local-storage',
  NFS = 'nfs',
  Ceph = 'ceph',
  Fusionstor = 'fusionstor',
  SharedMountPoint = 'smp',
  SharedBlock = 'SharedBlock',
  AliyunNAS = 'AliyunNAS',
  AliyunEBS = 'AliyunEBS'
}

registerEnumType(PrimaryStorageTypeParam, {
  name: 'PrimaryStorageTypeParam'
})

export enum SharedBlockGroupType {
  LvmVolumeGroupBasic = 'LvmVolumeGroupBasic'
}

registerEnumType(SharedBlockGroupType, {
  name: 'SharedBlockGroupType'
})

@ObjectType()
export class CephPrimaryStorageMon {
  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => String, { nullable: true })
  monAddr?: string

  @Field(() => String, { nullable: true })
  monPort?: string

  @Field(() => String, { nullable: true })
  monUuid?: string

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => String, { nullable: true })
  sshPassword?: string

  @Field(() => String, { nullable: true })
  sshPort?: string

  @Field(() => String, { nullable: true })
  sshUsername?: string

  @Field(() => String, { nullable: true })
  status?: string
}

@ObjectType()
export class PrimaryStorageSystemTag {
  @Field(() => Boolean, { nullable: true })
  nocephx: boolean

  @Field(() => Boolean, { nullable: true })
  thinProvision: boolean

  @Field(() => String, { nullable: true, description: 'ceph token' })
  cephToken?: string

  @Field(() => String, { nullable: true })
  coldMigrateNetwork?: string

  @Field(() => String, { nullable: true })
  thinProvisionUuid: string

  @Field(() => String, { nullable: true })
  gatewayCidr: string

  @Field(() => String, { nullable: true })
  rootVolumePoolName: string

  @Field(() => String, { nullable: true })
  dataVolumePoolName: string

  @Field(() => String, { nullable: true })
  imageCachePoolName: string

  @Field(() => String, { nullable: true })
  cephVendor?: string

  @Field(() => String, { nullable: true, description: 'NFS 挂载参数' })
  nfsMountOptions?: string
}

@ObjectType()
export class SharedBlocks {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  diskUuid: string

  @Field(() => String, { nullable: true })
  sharedBlockGroupUuid: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  status?: string
}

@ObjectType()
export class StorageCapacityForLocalStorage {
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  availableCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总可用容量（物理）'
  })
  availablePhysicalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总容量（物理）'
  })
  totalPhysicalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description:
      '总保留容量（物理），需要通过全局配置name=threshold.primaryStorage.physicalCapacity category=mevoco来计算'
  })
  reservedPhysicalCapacity?: number
}

@ObjectType()
export class MdsInfos {
  @Field(() => String)
  mdsAddr: string

  @Field(() => String)
  sshUsername: string

  @Field(() => String)
  sshPassword: string

  @Field(() => String)
  sshPort: string

  @Field(() => String)
  mdsStatus: string
}

@ObjectType()
export class AddonInfo {
  @Field(() => [ExternalPrimaryStoragePool], { nullable: true })
  pools?: ExternalPrimaryStoragePool[]

  @Field(() => [MdsInfos], { nullable: true, defaultValue: [] })
  mdsInfos?: MdsInfos[]
}

@ObjectType()
export class AddedExternalPrimaryStoragePool {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  aliasName?: string
}

@ObjectType()
export class ExternalPrimaryStoragePoolConfig {
  @Field(() => [AddedExternalPrimaryStoragePool], {
    description: '已经添加到主存储中的池子'
  })
  pools: AddedExternalPrimaryStoragePool[]
}

@ObjectType()
export class PrimaryStorage extends ResourceWithAttributes {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => [String], { nullable: true })
  attachedClusterUuids: string[]

  @Field(() => Float, {
    nullable: true,
    description: '主存储保留容量。category=primaryStorage name=reservedCapacity。默认值是"1G"',
    defaultValue: 1073741824
  })
  reservedCapacity?: number

  @Field(() => Float, { nullable: true })
  reservedPhysicalCapacity?: number

  @Field(() => Float, { nullable: true })
  availableCapacity?: number

  @Field(() => Float, { nullable: true })
  availablePhysicalCapacity?: number

  @Field(() => String, { nullable: true })
  fsid?: string

  @Field(() => [CephPrimaryStorageMon], { defaultValue: [] })
  mons?: CephPrimaryStorageMon[]

  @Field(() => String, { nullable: true })
  mountPath?: string

  @Field(() => String, { nullable: true })
  vCenterUuid?: string

  @Field(() => [CephPrimaryStoragePool], { nullable: true })
  pools?: CephPrimaryStoragePool[]

  @Field(() => SharedBlockGroupType, { nullable: true })
  sharedBlockGroupType?: SharedBlockGroupType

  @Field(() => SharedBlocks, { nullable: true })
  sharedBlocks?: SharedBlocks

  @Field(() => PrimaryStorageState, { nullable: true })
  state?: PrimaryStorageState

  @Field(() => PrimaryStorageStatus, { nullable: true })
  status?: PrimaryStorageStatus

  @Field(() => Float, { nullable: true })
  systemUsedCapacity?: number

  @Field(() => Float, { nullable: true })
  totalCapacity?: number

  @Field(() => Float, { nullable: true })
  totalPhysicalCapacity?: number

  @Field(() => PrimaryStorageType, { nullable: true })
  type?: PrimaryStorageType

  @Field(() => Int, { nullable: true })
  vmInstanceCount?: number

  @Field(() => Int, { nullable: true })
  volumeCount?: number

  @Field(() => Int, { nullable: true })
  baremetal2InstancesCount?: number

  @Field(() => Int, { nullable: true })
  cbdMdsCount?: number

  @Field(() => String, { nullable: true })
  url?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => LocalStorageHostCapacity, { nullable: true })
  storageCapacityForLocalStorage?: LocalStorageHostCapacity

  @Field(() => PrimaryStorageCapacity, { nullable: true })
  primaryStorageCapacity?: PrimaryStorageCapacity

  @Field(() => String)
  identity?: string

  @Field(() => AddonInfo, {
    nullable: true,
    description: '附加信息，比如：所有的存储池'
  })
  addonInfo?: AddonInfo

  @Field(() => ExternalPrimaryStoragePoolConfig, {
    nullable: true,
    description: '配置项，比如：已添加的存储池'
  })
  config?: ExternalPrimaryStoragePoolConfig

  @Field(() => [String], { nullable: true })
  outputProtocols?: string[]

  @Field(() => String, { nullable: true })
  defaultProtocol?: string
}

@ObjectType()
export class Expired {
  @Field(() => Boolean, { nullable: true })
  isExpired?: boolean

  @Field(() => Int, { nullable: true })
  dayDifference?: number
}

@ObjectType()
export class ClusterUuidAndNameRef {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string
}

@ObjectType()
export class PrimaryStorageVO extends PrimaryStorage {
  @Field(() => PrimaryStorageSystemTag, { nullable: true })
  systemTag?: PrimaryStorageSystemTag

  @Field(() => Zone, { nullable: true })
  zone?: Zone

  @Field(() => [ClusterUuidAndNameRef], { nullable: true, defaultValue: [] })
  clusters?: ClusterUuidAndNameRef[]

  @Field(() => Expired, { nullable: true })
  expired?: Expired
}

@InputType()
export class AddLocalPrimaryStorageInput {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  url: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => [String], { nullable: true })
  systemTags: [string]
}

@InputType()
export class AddNfsPrimaryStorageInput {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String)
  url: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => [String], { nullable: true, description: '存储网络 | 挂载参数' })
  systemTags: [string]
}

@InputType()
export class AddSharedMountPointPrimaryStorageInput extends AddNfsPrimaryStorageInput {}

@InputType()
export class AddCephPrimaryStorageInput {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => [String])
  monUrls: string[]

  @Field(() => String, { nullable: true })
  rootVolumePoolName: string

  @Field(() => String, { nullable: true })
  dataVolumePoolName: string

  @Field(() => String, { nullable: true })
  imageCachePoolName: string

  @Field(() => [String], {
    nullable: true,
    description: '存储网络 | 关闭 Cephx'
  })
  systemTags: [string]
}

@InputType()
export class AddSharedBlockGroupPrimaryStorageInput {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => [String])
  diskUuids: string[]

  @Field(() => [String], {
    nullable: true,
    description: '存储网络 | 厚置备 | 清理块设备'
  })
  systemTags: [string]
}

@InputType()
export class AddAliyunNasPrimaryStorageInput {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  url: string

  @Field(() => String)
  nasUuid: string

  @Field(() => String)
  accessGroupUuid: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => [String], {
    nullable: true
  })
  systemTags: [string]
}

@InputType()
export class AddAliyunEbsPrimaryStorageInput {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  url: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  tdcConfigContent: string

  @Field(() => String, { nullable: true })
  identityZoneUuid?: string

  @Field(() => String, { nullable: true })
  defaultIoType?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@ObjectType()
export class PrimaryStorageActionResp {
  @Field(() => PrimaryStorage, { nullable: true })
  result?: PrimaryStorage

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class PrimaryStorageQueryResp extends QueryCommonResponse(PrimaryStorageVO) {}

export enum PrimaryStorageQueryType {
  Normal = 'Normal',
  Zstack = 'Zstack',
  CreateVmForRootVolumeCandidate = 'CreateVmForRootVolumeCandidate',
  CreateVmForDataVolumeCandidate = 'CreateVmForDataVolumeCandidate',
  CreatevCenterVolumeVmCandidate = 'CreatevCenterVolumeVmCandidate',
  CreatevCenterVolumeImageVmCandidate = 'CreatevCenterVolumeImageVmCandidate',
  StorageMigrateVm = 'StorageMigrateVm',
  StorageMigrateVpcRouter = 'StorageMigrateVpcRouter',
  ClusterAttachablePs = 'ClusterAttachablePs',
  GetPrimaryStorageCandidatesForVolumeMigration = 'GetPrimaryStorageCandidatesForVolumeMigration',
  CreateDataVolumeByVolumeImageGetCandidatePrimaryStorage = 'CreateDataVolumeByVolumeImageGetCandidatePrimaryStorage',
  vCenterPrimaryStorageList = 'vCenterPrimaryStorageList',
  RecoverRootVolumeBackupCandidate = 'RecoverRootVolumeBackupCandidate',
  RecoverDataVolumeBackupCandidate = 'RecoverDataVolumeBackupCandidate',
  OvfImport = 'OvfImport',
  ////////////---------------Blow For ZSphere---------------------//////

  // CreateInstanceDiskOptionFromCluster = 'CreateInstanceDiskOptionFromCluster',
  CreateInstanceDiskOptionFromHostInLocalStorageType = 'CreateInstanceDiskOptionFromHostInLocalStorageType'
}

registerEnumType(PrimaryStorageQueryType, {
  name: 'PrimaryStorageQueryType'
})

@ArgsType()
export class QueryPrimaryStorageArgs extends QueryAction {
  @Field(() => PrimaryStorageQueryType, { nullable: true })
  declare type?: PrimaryStorageQueryType
}

@ObjectType()
class PraimayStorageLabels {
  @Field(() => String)
  PrimaryStorageUuid: string
}
@ObjectType()
export class PrimaryStorageMetricData extends MetricData {
  @Field(() => PraimayStorageLabels)
  labels: PraimayStorageLabels
}

@ObjectType()
export class PrimaryStorageSummary {
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
@ObjectType()
export class PrimaryStorageRelatedSummary {
  @Field(() => Int)
  vmInstance: number

  @Field(() => Int)
  baremetal2Instance: number

  @Field(() => Int)
  volume: number

  @Field(() => Int)
  blockVolume: number

  @Field(() => Int)
  cluster: number

  @Field(() => Int)
  baremetal2Cluster: number

  @Field(() => Int)
  host: number

  @Field(() => Int)
  sharedBlock: number

  @Field(() => Int)
  vpcRouter: number
}

@ArgsType()
export class GetClusterAttachablePrimaryStorageTypesArgs {
  @Field(() => String)
  clusterUuid: string
}

@ObjectType()
export class ClusterAttachablePrimaryStorageTypes {
  @Field(() => [String], { nullable: true, defaultValue: [] })
  types: string[]
}

@ArgsType()
export class PrimaryStorageRelatedClusterArgs {
  @Field(() => [String])
  primaryStorageUuids: string[]

  @Field(() => [String])
  clusterUuids: string[]
}

@ObjectType()
export class PrimaryStorageRelatedClusterSummary {
  @Field(() => Int)
  vmCount: number

  @Field(() => Int)
  vmOnNetworkCount: number

  @Field(() => Int)
  vpcVrouterCount: number

  @Field(() => Int)
  volumeCount: number
}

@ObjectType()
export class PrimaryStorageRelatedBaremetal2ClusterSummary {
  @Field(() => Int)
  baremetal2InstanceCount: number

  @Field(() => Int)
  volumeCount: number
}

@ObjectType()
export class TrashOnPrimaryStorage {
  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  resourceType: string

  @Field(() => TrashType, { nullable: true })
  trashType?: TrashType
}

@ObjectType()
export class TrashOnPrimaryStorageResp {
  @Field(() => [TrashOnPrimaryStorage], { defaultValue: [] })
  list?: TrashOnPrimaryStorage[]
}

@ArgsType()
export class BlockMetadataArgs {
  @Field(() => String)
  vendorName: string

  @Field(() => String)
  metadata: string
}

@ObjectType()
export class BlockMetadataResp {
  @Field(() => String)
  accessZones: string

  @Field(() => String)
  storagePools: string
}

@ObjectType()
export class BlockDetailInfoResp {
  @Field(() => String)
  ip: string

  @Field(() => Int)
  port: number

  @Field(() => String)
  storagePool: string
}

@ArgsType()
export class PrimaryStoragePredictionCapacityArgs {
  @Field(() => String)
  primaryStorageUuid: string

  @Field(() => String, { nullable: true })
  poolUuid: string

  @Field(() => Float)
  startTime: number

  @Field(() => Float)
  currentTime: number

  @Field(() => Float)
  endTime: number
}

@ObjectType()
export class PrimaryStoragePredictionCapacityItem {
  @Field(() => Float)
  value: number

  @Field(() => Float)
  time: number

  @Field(() => String)
  type: string
}

@ObjectType()
export class PrimaryStoragePredictionCapacityData {
  @Field(() => [PrimaryStoragePredictionCapacityItem], { defaultValue: [] })
  usedPhysicalCapacitiesForecastList: PrimaryStoragePredictionCapacityItem[]

  @Field(() => [PrimaryStoragePredictionCapacityItem], { defaultValue: [] })
  usedPhysicalCapacitiesHistoryList: PrimaryStoragePredictionCapacityItem[]

  @Field(() => [PrimaryStoragePredictionCapacityItem], { defaultValue: [] })
  totalPhysicalCapacitiesHistoryList: PrimaryStoragePredictionCapacityItem[]

  @Field(() => [PrimaryStoragePredictionCapacityItem], { defaultValue: [] })
  physicalCapacitiesAlarmThresholdList: PrimaryStoragePredictionCapacityItem[]

  @Field(() => PrimaryStoragePredictionCapacityItem, { nullable: true })
  predictAlarmPoint: PrimaryStoragePredictionCapacityItem

  @Field(() => PrimaryStoragePredictionCapacityItem, { nullable: true })
  currentDayPoint: PrimaryStoragePredictionCapacityItem
}

@ObjectType()
export class PrimaryStorageRelatedResourceCounts {
  @Field(() => Int, { nullable: true })
  vm?: number
  @Field(() => Int, { nullable: true })
  hardDisk?: number
  @Field(() => Int, { nullable: true })
  host?: number
  @Field(() => Int, { nullable: true })
  cluster?: number
}
