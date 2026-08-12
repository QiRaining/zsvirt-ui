import {
  ObjectType,
  Field,
  Float,
  InputType,
  registerEnumType,
  Int,
  ArgsType
} from '@nestjs/graphql'

import { CpuArchitecture, ImageMediaType, ImagePlatform } from '@/common/enum'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { BackupStorage } from '@/hardware-resource/backup-storage/backup-storage.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

@ObjectType()
export class BackupStorageRef {
  @Field(() => String)
  imageUuid: string

  @Field(() => String)
  backupStorageUuid: string

  @Field(() => String, { nullable: true })
  installPath?: string

  @Field(() => String)
  status: string

  @Field(() => String, { nullable: true })
  exportMd5Sum?: string

  @Field(() => String, { nullable: true })
  exportUrl?: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class Owner {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => String)
  type: string
}

export enum ImageState {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}

export enum ImageStateEvent {
  enable = 'enable',
  disable = 'disable'
}

export enum ImageStatus {
  Creating = 'Creating',
  Downloading = 'Downloading',
  Ready = 'Ready',
  Error = 'Error',
  Deleted = 'Deleted',
  Migrating = 'Migrating'
}

export enum ImageBootMode {
  Legacy = 'Legacy',
  UEFI = 'UEFI',
  UEFI_WITH_CSM = 'UEFI_WITH_CSM'
}

export enum ImageFormat {
  qcow2 = 'qcow2',
  iso = 'iso',
  raw = 'raw',
  vmtx = 'vmtx'
}

export enum ImageQueryType {
  NORMAL = 'NORMAL',
  GetCandidateImagesForCreatingVm = 'GetCandidateImagesForCreatingVm',
  GET_CANDIDATE_ISO_FOR_ATTACHING_VM = 'GET_CANDIDATE_ISO_FOR_ATTACHING_VM',
  GET_DETACHABLE_ISO_FROM_VM = 'GET_DETACHABLE_ISO_FROM_VM',
  GET_IMAGE_CANDIDATES_FOR_VM_TO_CHANGE = 'GET_IMAGE_CANDIDATES_FOR_VM_TO_CHANGE',
  GET_IMAGE_CANDIDATES_FOR_AUTO_SCALING_GROUP = 'GET_IMAGE_CANDIDATES_FOR_AUTO_SCALING_GROUP',
  SHARED_RESOURCE = 'SHARED_RESOURCE',
  MINE_RESOURCE = 'MINE_RESOURCE',
  GET_IMAGE_CANDIDATES_FOR_HYBRID_IMAGE_UPLOAD = 'GET_IMAGE_CANDIDATES_FOR_HYBRID_IMAGE_UPLOAD',
  ZSV_SHARED_RESOURCE = 'ZSV_SHARED_RESOURCE',
  ZSV_NOT_SHARED_RESOURCE = 'ZSV_NOT_SHARED_RESOURCE'
}

export enum ImageUseFor {
  SLB = 'SLB',
  vrouter = 'vrouter'
}

registerEnumType(ImageQueryType, {
  name: 'ImageQueryType'
})

registerEnumType(ImageStateEvent, {
  name: 'ImageStateEvent'
})

registerEnumType(ImageState, {
  name: 'ImageState'
})

registerEnumType(ImageStatus, {
  name: 'ImageStatus'
})

registerEnumType(ImageBootMode, {
  name: 'ImageBootMode'
})

registerEnumType(ImageFormat, {
  name: 'ImageFormat'
})

registerEnumType(ImageUseFor, {
  name: 'ImageUseFor'
})

@ObjectType()
export class Image {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => CpuArchitecture, { nullable: true })
  architecture?: CpuArchitecture

  @Field(() => String, { nullable: true })
  exportUrl?: string

  @Field(() => ImageState)
  state: ImageState

  @Field(() => ImageStatus)
  status: ImageStatus

  @Field(() => Float)
  size: string

  @Field(() => Float)
  actualSize: string

  @Field(() => String, { nullable: true })
  md5Sum?: string

  @Field(() => String)
  url: string

  @Field(() => ImageMediaType)
  mediaType: ImageMediaType

  @Field(() => String, { nullable: true })
  guestOsType?: string

  @Field(() => String)
  type: string

  @Field(() => ImagePlatform, { nullable: true })
  platform?: ImagePlatform

  @Field(() => ImageFormat, { nullable: true })
  format: ImageFormat

  @Field(() => Boolean)
  system: boolean

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => ImageBootMode, {
    nullable: true,
    defaultValue: ImageBootMode.Legacy
  })
  bootMode?: ImageBootMode

  @Field(() => Boolean, { nullable: true })
  qga?: boolean

  @Field(() => Boolean, { nullable: true })
  baremetal2Image?: boolean

  @Field(() => [BackupStorageRef], { nullable: true })
  backupStorageRefs?: [BackupStorageRef]

  @Field(() => BackupStorage, { nullable: true })
  backupStorage?: BackupStorage

  @Field(() => Owner, { nullable: true })
  owner?: Owner

  @Field(() => Boolean, { nullable: true })
  toPublic?: boolean

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => ImageUseFor, { nullable: true })
  useFor?: ImageUseFor

  @Field(() => Boolean, { nullable: true })
  virtio?: boolean

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: 'UserVm, 状态非Destroyed'
  })
  availableUserVm?: number

  @Field(() => Boolean, { nullable: true })
  isZmigrateImage?: boolean
}

@ObjectType()
export class ImageSummary {
  @Field(() => Int, { nullable: true })
  total: number

  @Field(() => Int, { nullable: true })
  available: number

  @Field(() => Int, { nullable: true })
  destroyed: number
}

@ArgsType()
export class QueryImageArgs extends QueryAction {
  @Field(() => ImageQueryType, { nullable: true })
  declare type?: ImageQueryType
}

@ObjectType()
export class ImageQueryResp extends QueryCommonResponse(Image) {}

@ObjectType()
export class ExportImageFromBackupStorageResult {
  @Field(() => String, { nullable: true })
  imageUrl?: string

  @Field(() => String, { nullable: true })
  exportMd5Sum?: string

  @Field(() => Boolean, { nullable: true })
  success?: boolean
}

@ObjectType()
export class ExportImageFromBackupStorageResp {
  @Field(() => ExportImageFromBackupStorageResult, { nullable: true })
  result?: ExportImageFromBackupStorageResult

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class ImageActionResp {
  @Field(() => Image, { nullable: true })
  result?: Image

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class DetachIsoFromVmInstanceInput {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  isoUuid?: string
}

@InputType()
export class ExportImageFromBackupStorageInput {
  @Field(() => String)
  imageUuid: string

  @Field(() => String)
  backupStorageUuid: string
}

@ObjectType()
export class ImageList {
  @Field(() => [Image], { defaultValue: [] })
  list?: Image[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class OsChildren {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  osRelease: string

  @Field(() => String)
  platform: string

  @Field(() => String, { nullable: true })
  version: string

  @Field(() => String, { nullable: true })
  uuid: string
}
@ObjectType()
export class GuestChildren {
  @Field(() => String, { nullable: true })
  guestName: string

  @Field(() => [OsChildren], { nullable: true })
  children?: OsChildren[]
}
@ObjectType()
export class GuestOsType {
  @Field(() => String)
  platform: string

  @Field(() => [GuestChildren], { nullable: true })
  children?: GuestChildren[]
}

@ObjectType()
export class GuestOsTypeList {
  @Field(() => [GuestOsType], { defaultValue: [] })
  list?: GuestOsType[]

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class ManagementNodeArch {
  @Field(() => String, { nullable: true })
  architecture?: string
}

export enum CpuMemHotAdd {
  supported = 'supported',
  notSupport = 'notSupport'
}

registerEnumType(CpuMemHotAdd, {
  name: 'CpuMemHotAdd'
})

@ObjectType()
export class GuestOsCpuMemHotAddInfo {
  @Field(() => String)
  name: string

  @Field(() => String)
  bits: string

  @Field(() => CpuMemHotAdd)
  cpuMemHotAdd: CpuMemHotAdd

  @Field(() => String)
  guestOsType: string
}

@ObjectType()
export class GuestOsCpuMemHotAddInfoList {
  @Field(() => [GuestOsCpuMemHotAddInfo], { defaultValue: [] })
  list: GuestOsCpuMemHotAddInfo[]

  @Field(() => Int)
  total: number
}
