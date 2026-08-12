import {
  ArgsType,
  Field,
  Float,
  InputType,
  ObjectType,
  PickType,
  registerEnumType,
  Int
} from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { UpdateGlobalConfigPayload } from '@/settings/global-config/action/update-global-config'

import { SecretResourcePool } from '../secret-resource-pool/secret-resource-pool.model'
@InputType()
export class PickGlobalConfig extends PickType(UpdateGlobalConfigPayload, ['category', 'name']) {}

@InputType()
export class GlobalConfigAndRcPoolInput {
  @Field(() => PickGlobalConfig)
  declare stateGloCfg: PickGlobalConfig

  @Field(() => PickGlobalConfig)
  declare resourceGloCfg: PickGlobalConfig
}

@ObjectType()
export class GlobalConfigAndRcPool {
  @Field(() => Boolean)
  state: boolean

  @Field(() => SecretResourcePool, { nullable: true })
  declare secretResourcePool?: SecretResourcePool
}

@ObjectType()
export class GlobalConfigAndSecretResourcePool {
  @Field(() => String)
  category: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  value?: string

  @Field(() => SecretResourcePool, { nullable: true })
  secretResourcePool?: SecretResourcePool
}

@InputType()
export class GlobalConfigInput {
  @Field(() => String)
  category: string

  @Field(() => String)
  name: string
}

@ArgsType()
export class QueryGlobalConfigAndSecretResourcePoolArgs {
  @Field(() => [GlobalConfigInput])
  globalConfigs: GlobalConfigInput[]
}

@ObjectType()
export class GlobalConfigAndSecretResourcePoolList extends QueryCommonResponse(
  GlobalConfigAndSecretResourcePool
) {}

@InputType()
export class QueryEnableCryptoComplianceProgressInput {
  @Field(() => String)
  actionId: string

  @Field(() => String)
  apiId: string
}

export enum EnableCryptoComplianceProgressItemState {
  unProtect = 'unProtect',
  protecting = 'protecting',
  protected = 'protected',
  waitProtect = 'waitProtect',
  protectFailed = 'protectFailed'
}
registerEnumType(EnableCryptoComplianceProgressItemState, {
  name: 'EnableCryptoComplianceProgressItemState'
})

export enum EnableCryptoComplianceProgressItemType {
  zsActionAPi = 'zsActionAPi',
  zsRolePrivilege = 'zsRolePrivilege',
  APIStartDataProtectionMsg = 'APIStartDataProtectionMsg'
}
registerEnumType(EnableCryptoComplianceProgressItemType, {
  name: 'EnableCryptoComplianceProgressItemType'
})

@ObjectType()
export class EnableCryptoComplianceProgressItem {
  @Field(() => Float)
  percent: number

  @Field(() => EnableCryptoComplianceProgressItemState)
  state: EnableCryptoComplianceProgressItemState

  @Field(() => EnableCryptoComplianceProgressItemType)
  type: EnableCryptoComplianceProgressItemType

  @Field(() => Int, { nullable: true })
  totalCount?: number

  @Field(() => Int, { nullable: true })
  signedCount?: number

  @Field(() => Int, { nullable: true })
  time: number
}

@ObjectType()
export class EnableCryptoComplianceProgress {
  @Field(() => [EnableCryptoComplianceProgressItem])
  progressList: EnableCryptoComplianceProgressItem[]

  @Field(() => Int)
  encryptMilliseconds: number
}

@InputType()
export class GetDataProtectionRelatedSummaryInput {
  @Field(() => Int)
  operationLogDays: number

  @Field(() => Int)
  auditsDays: number
}

@ObjectType()
export class DataProtectionRelatedSummary {
  @Field(() => Int)
  operationLogCount: number

  @Field(() => Int)
  auditsCount: number

  @Field(() => Int)
  importConfigCount: number

  @Field(() => Int)
  accessControlRuleCount: number

  @Field(() => Int)
  rolePolicyStatementCount: number

  @Field(() => Int)
  rolePrivilegesCount: number

  @Field(() => Int)
  imageCount: number

  @Field(() => Int)
  snapshotCount: number

  @Field(() => Int)
  passwordCount: number

  @Field(() => Int)
  sensitiveDataCount: number
}
