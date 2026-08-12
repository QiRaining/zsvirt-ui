import { registerEnumType } from '@nestjs/graphql'

import { LicenseType } from './zstack'

export enum LunSource {
  fiberChannel = 'fiberChannel',
  NVMe = 'NVMe',
  iSCSI = 'iSCSI'
}

registerEnumType(LunSource, {
  name: 'LunSource'
})

export enum OperatorState {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED'
}

registerEnumType(OperatorState, {
  name: 'OperatorState'
})

export enum BackupStorageType {
  AliyunEBS = 'AliyunEBS',
  Ceph = 'Ceph',
  ImageStoreBackupStorage = 'ImageStoreBackupStorage',
  VCenter = 'VCenter',
  SftpBackupStorage = 'SftpBackupStorage'
}

registerEnumType(BackupStorageType, {
  name: 'BackupStorageType',
  description: '通过API GetBackupStorageTypes 获取'
})

export enum PrimaryStorageType {
  BlockStorage = 'BlockStorage',
  AliyunNAS = 'AliyunNAS',
  AliyunEBS = 'AliyunEBS',
  Addon = 'Addon',
  MiniStorage = 'MiniStorage',
  SharedBlock = 'SharedBlock',
  SharedMountPoint = 'SharedMountPoint',
  Ceph = 'Ceph',
  NFS = 'NFS',
  VCenter = 'VCenter',
  LocalStorage = 'LocalStorage'
}

registerEnumType(PrimaryStorageType, {
  name: 'PrimaryStorageType',
  description: '通过API GetPrimaryStorageTypes 获取'
})

export enum ResourceTypeVO {
  ZoneVO = 'ZoneVO',
  ClusterVO = 'ClusterVO',
  HostVO = 'HostVO',
  VmInstanceVO = 'VmInstanceVO',
  BareMetalChassisVO = 'BareMetalChassisVO',
  BareMetalInstanceVO = 'BareMetalInstanceVO'
}

registerEnumType(ResourceTypeVO, {
  name: 'ResourceTypeVO'
})

export enum ImageMediaType {
  RootVolumeTemplate = 'RootVolumeTemplate',
  DataVolumeTemplate = 'DataVolumeTemplate',
  ISO = 'ISO'
}

registerEnumType(ImageMediaType, {
  name: 'ImageMediaType'
})

export enum LicenseProductVersions {
  Preset = 'Preset',
  Basic = 'Basic',
  Standard = 'Standard',
  Advanced = 'Advanced',
  Enterprise = 'Enterprise'
}

registerEnumType(LicenseProductVersions, {
  name: 'LicenseProductVersions'
})

export enum LicenseProductProducts {
  Cloud = 'Cloud',
  CMP = 'CMP',
  ZSV = 'ZSV'
}

registerEnumType(LicenseProductProducts, {
  name: 'LicenseProductProducts'
})

export enum AliyunRouterConnectionRole {
  AcceptingSide = 'AcceptingSide',
  InitiatingSide = 'InitiatingSide'
}

registerEnumType(AliyunRouterConnectionRole, {
  name: 'AliyunRouterConnectionRole'
})

export const UIExtendedLicenseType = {
  Basic: 'Basic',
  Standard: 'Standard',
  ...LicenseType
}

export type UIExtendedLicenseType =
  (typeof UIExtendedLicenseType)[keyof typeof UIExtendedLicenseType]

registerEnumType(UIExtendedLicenseType, {
  name: 'UIExtendedLicenseType'
})

export enum EndPointType {
  SYSTEM_HTTP = 'SYSTEM_HTTP',
  Email = 'Email',
  AliyunSms = 'AliyunSms',
  DingTalk = 'DingTalk',
  FeiShu = 'FeiShu',
  WeCom = 'WeCom',
  HTTP = 'HTTP',
  MicrosoftTeams = 'MicrosoftTeams',
  SNMP = 'SNMP'
}

registerEnumType(EndPointType, {
  name: 'EndPointType'
})

export enum EndPointState {
  'Enabled' = 'Enabled',
  'Disabled' = 'Disabled'
}

registerEnumType(EndPointState, {
  name: 'EndPointState'
})

export enum RedundancyPolicy {
  Erasure = 'Erasure',
  Replicated = 'Replicated'
}

registerEnumType(RedundancyPolicy, {
  name: 'RedundancyPolicy'
})
