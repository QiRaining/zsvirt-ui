import {
  ArgsType,
  Field,
  Float,
  Int,
  ObjectType,
  OmitType,
  registerEnumType
} from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { UIExtendedLicenseType } from '@/common/enum'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'

export enum ProdInfo {
  Enterprise = 'Enterprise.Cloud',
  Standard = 'Standard.Cloud',
  Basic = 'Basic.Cloud',
  ZStack = 'ZStack',
  ZStackLicense = 'ZStack license',
  //---
  BasicZSV = 'Basic.ZSV',
  BasicXinChuangZSV = 'Basic.XinChuang.ZSV',
  AdvancedZSV = 'Advanced.ZSV',
  AdvancedXinChuangZSV = 'Advanced.XinChuang.ZSV',
  ProZSV = 'Pro.ZSV',
  ProXinChuangZSV = 'Pro.XinChuang.ZSV',
  //----
  ProXinChuang = 'Pro.XinChuang.Cloud',
  EnterpriseXinChuang = 'Enterprise.XinChuang.Cloud',
  EnterpriseXinChuangCloud = 'Enterprise.XinChuang.Cloud'
}

//用于映射auth.json
export enum LicenseFileName {
  AdvancedXinChuangZSV = 'AdvancedXinChuangZSV',
  AdvancedZSV = 'AdvancedZSV',
  Basic = 'Basic',
  BasicXinChuangZSV = 'BasicXinChuangZSV',
  BasicZSV = 'BasicZSV',
  Enterprise = 'Enterprise',
  EnterpriseXinChuang = 'EnterpriseXinChuang',
  EnterpriseXinChuangCloud = 'EnterpriseXinChuangCloud',
  ProXinChuang = 'ProXinChuang',
  ProZSV = 'ProZSV',
  Standard = 'Standard',
  ZStack = 'ZStack',
  ZStackLicense = 'ZStackLicense',

  // --- TODO For tsc 后续需要检查是否还有
  XinChuang = 'XinChuang',
  Prepaid = 'Prepaid'
}

export enum UKeyStatus {
  Ready = 'Ready',
  Missing = 'Missing',
  Fault = 'Fault',
  Abnormal = 'Abnormal'
}

export enum LicenseSource {
  UploadFile = 'UploadFile',
  UKey = 'UKey',
  Ctl = 'Ctl',
  InternalMINI = 'InternalMINI',
  Legacy = 'Legacy'
}

export enum LicenseAttribute {
  Free = 'Free'
}

registerEnumType(LicenseAttribute, { name: 'LicenseAttribute' })

registerEnumType(ProdInfo, {
  name: 'ProdInfo'
})

registerEnumType(LicenseFileName, {
  name: 'LicenseFileName'
})

registerEnumType(UKeyStatus, {
  name: 'UKeyStatus'
})

registerEnumType(LicenseSource, {
  name: 'LicenseSource'
})

@ObjectType()
export class LicenseAddition {
  @Field(() => String, { nullable: true })
  path: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  info: string

  @Field(() => String, { nullable: true })
  primaryLicenseInfo: string

  @Field(() => String, { nullable: true })
  zmigrateKey?: string
}

@ObjectType()
export class VersionType {
  @Field(() => String, { nullable: true })
  version?: string
}

export enum LicenseQuotaType {
  VM = 'VM',
  Host = 'Host',
  Capacity = 'Capacity',
  None = 'None',
  CPUSocket = 'CPUSocket',
  CPUCore = 'CPUCore'
}

registerEnumType(LicenseQuotaType, {
  name: 'LicenseQuotaType'
})

@ObjectType()
export class LicenseUsage {
  @Field(() => BigInt, { nullable: true })
  available?: number

  @Field(() => BigInt, { nullable: true })
  quota?: number

  @Field(() => LicenseQuotaType, { nullable: true })
  quotaType?: LicenseQuotaType

  @Field(() => BigInt, { nullable: true })
  used?: number
}

@ObjectType()
export class LicenseInfo {
  // Community
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => UIExtendedLicenseType)
  licenseType: UIExtendedLicenseType

  @Field(() => ProdInfo, { nullable: true })
  prodInfo?: ProdInfo

  @Field(() => String)
  licenseRequest: string

  @Field(() => String, { nullable: true })
  expiredDate?: string

  @Field(() => String, { nullable: true })
  issuedDate?: string

  @Field(() => String, { nullable: true })
  user?: string

  @Field(() => Float, { nullable: true })
  hostNum?: number

  @Field(() => Int, { nullable: true })
  availableHostNum?: number

  @Field(() => Float, { nullable: true })
  cpuNum?: number

  @Field(() => Int, { nullable: true })
  availableCpuNum?: number

  @Field(() => Float, { nullable: true })
  vmNum?: number

  @Field(() => Int, { nullable: true })
  availableVmNum?: number

  @Field(() => Boolean, { defaultValue: false })
  expired: boolean

  @Field(() => String, { nullable: true })
  managementNodeUuid?: string

  @Field(() => Boolean, { nullable: true })
  isCube?: boolean

  @Field(() => String, { nullable: true })
  cubeVersion?: string

  @Field(() => String, { nullable: true })
  version?: string

  @Field(() => String, { nullable: true })
  versionOnUI?: string

  @Field(() => [LicenseAddition], { nullable: true })
  additions?: LicenseAddition[]

  @Field(() => String, { nullable: true })
  platformId?: string

  @Field(() => LicenseUsage, { nullable: true })
  usage?: LicenseUsage
}
@ObjectType()
export class LicenseAddOn {
  @Field(() => String)
  uuid: string

  @Field(() => UIExtendedLicenseType)
  licenseType: UIExtendedLicenseType

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [String], { defaultValue: [] })
  modules: string[]

  @Field(() => Float, { nullable: true })
  hostNum?: number

  @Field(() => Float, { nullable: true })
  availableHostNum?: number

  @Field(() => Float, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  availableCpuNum?: number

  @Field(() => Float, { nullable: true })
  vmNum?: number

  @Field(() => Float, { nullable: true })
  availableVmNum?: number

  @Field(() => String, { nullable: true })
  expiredDate?: string

  @Field(() => String, { nullable: true })
  issuedDate?: string

  @Field(() => Boolean, { defaultValue: false })
  expired: boolean

  @Field(() => String, { nullable: true })
  managementNodeUuid?: string

  @Field(() => LicenseAttribute, { nullable: true })
  licenseAttribute?: LicenseAttribute

  @Field(() => LicenseUsage, { nullable: true })
  usage?: LicenseUsage
}

@ObjectType()
export class XskyLicense {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  expireTime: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class DualManagementNodeInfo {
  @Field(() => [LicenseInfo], { nullable: true })
  licenses?: LicenseInfo[]

  @Field(() => [LicenseAddOn], { nullable: true })
  addOns?: LicenseAddOn[]
}

@ObjectType()
export class LicenseInfoResp extends LicenseInfo {
  @Field(() => Boolean, { nullable: true })
  opensource?: boolean

  @Field(() => [String], { nullable: true })
  hostNameList?: string[]

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isDualManagementNode?: boolean

  @Field(() => DualManagementNodeInfo, { nullable: true })
  dualManagementNodeInfo?: DualManagementNodeInfo

  @Field(() => [String], { nullable: true })
  statusList?: string[]
}

@ObjectType()
export class LicenseInfoExtensionResp {
  @Field(() => Boolean, { nullable: true })
  opensource?: boolean

  @Field(() => [String], { nullable: true })
  hostNameList?: string[]

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isDualManagementNode?: boolean

  @Field(() => DualManagementNodeInfo, { nullable: true })
  dualManagementNodeInfo?: DualManagementNodeInfo

  @Field(() => [String], { nullable: true })
  statusList?: string[]

  @Field(() => [LicenseAddition], { nullable: true })
  additions?: LicenseAddition[]
}

@ObjectType()
export class LicenseExtraInfo {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  occupiedCpuNum: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  occupiedHostNum: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  occupiedVmNum: number
}

@ObjectType()
export class LicenseAddOnWithOccupied extends LicenseAddOn {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  occupiedCPUs?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  occupiedHosts?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  occupiedVMs?: number
}

@ObjectType()
export class LicenseRecords {
  @Field(() => Boolean, { defaultValue: false })
  expired: boolean

  @Field(() => String, { nullable: true })
  expiredDate?: string

  @Field(() => String, { nullable: true })
  issuedDate?: string

  @Field(() => UIExtendedLicenseType)
  licenseType: UIExtendedLicenseType

  @Field(() => String, { nullable: true })
  managementNodeUuid?: string

  @Field(() => [String], { defaultValue: [] })
  modules: string[]

  @Field(() => String, { nullable: true })
  uploadDate?: string

  @Field(() => String, { nullable: true })
  user?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Float, { nullable: true })
  hostNum?: number

  @Field(() => Float, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  vmNum?: number

  @Field(() => Float, { nullable: true }) //for storage
  capacity?: number

  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  uid: string

  @Field(() => LicenseSource, { nullable: true })
  source: LicenseSource

  @Field(() => ProdInfo, { nullable: true })
  prodInfo: ProdInfo

  @Field(() => LicenseQuotaType, { nullable: true })
  quotaType?: LicenseQuotaType
}

@ObjectType()
export class LicenseRecordsQueryResp extends QueryCommonResponse(LicenseRecords) {}

@ObjectType()
export class LicenseAddOnResp {
  @Field(() => [LicenseAddOnWithOccupied])
  addOns: LicenseAddOnWithOccupied[]

  @Field(() => LicenseExtraInfo)
  extraInfo: LicenseExtraInfo
}

@ObjectType()
export class LicenseUSBKeyStatus {
  @Field(() => String, { nullable: true })
  managementNodeUuid?: string

  @Field(() => UKeyStatus, { nullable: true })
  status?: UKeyStatus

  @Field(() => String, { nullable: true })
  keyId?: string
}

@ArgsType()
export class QueryLicenseRecordArgs extends OmitType(QueryAction, ['sortBy']) {
  @Field(() => String, {
    nullable: true,
    defaultValue: 'uploadDate'
  })
  declare sortBy?: string
}

@ObjectType()
export class ModuleAuthorizationDetails {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  key?: string

  @Field(() => Int, { nullable: true })
  type?: number

  @Field(() => String, { nullable: true })
  activated?: string

  @Field(() => Int, { nullable: true })
  count?: number

  @Field(() => String, { nullable: true })
  expired_date?: string

  @Field(() => Int, { nullable: true })
  consumed?: number

  @Field(() => Boolean, { nullable: true })
  is_active?: boolean

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => Boolean, { nullable: true })
  is_valid?: boolean

  @Field(() => String, { nullable: true })
  comment?: string

  @Field(() => String, { nullable: true })
  vendor?: string
}

@ObjectType()
export class ModuleAuthorizationDetailsQueryResp extends QueryCommonResponse(
  ModuleAuthorizationDetails
) {}

@ArgsType()
export class QueryModuleAuthorizationDetailsArgs extends QueryAction {}

@ObjectType()
export class PointsDetails {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  resourceName?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  activationTime?: string

  @Field(() => String, { nullable: true })
  expireTime?: string
}

@ObjectType()
export class PointsDetailsQueryResp extends QueryCommonResponse(PointsDetails) {}

@ArgsType()
export class QueryPointsDetailsArgs extends QueryAction {
  @Field(() => String, { nullable: true, description: '按 license key 过滤' })
  licenseKey?: string
}
