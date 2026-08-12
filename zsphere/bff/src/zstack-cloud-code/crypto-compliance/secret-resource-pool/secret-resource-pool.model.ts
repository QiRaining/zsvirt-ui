import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  OmitType,
  registerEnumType
} from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

import { SecurityMachineType } from '../security-machine/security-machine.model'

export enum SecretResourcePoolQueryType {
  Normal = 'Normal',
  GetSrpCandidateSecyMach = 'GetSrpCandidateSecyMach'
}
registerEnumType(SecretResourcePoolQueryType, {
  name: 'SecretResourcePoolQueryType'
})
@ArgsType()
export class QuerySecretResourcePoolArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => SecretResourcePoolQueryType, {
    nullable: true,
    defaultValue: SecretResourcePoolQueryType.Normal
  })
  declare type?: SecretResourcePoolQueryType
}

export enum SecretResourcePoolState {
  Activated = 'Activated',
  Unactivated = 'Unactivated'
}
registerEnumType(SecretResourcePoolState, { name: 'SecretResourcePoolState' })

export enum SecretResourcePoolStatus {
  Connected = 'Connected',
  Disconnected = 'Disconnected'
}
registerEnumType(SecretResourcePoolStatus, {
  name: 'SecretResourcePoolStatus'
})

export enum SecretResourcePoolType {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}
registerEnumType(SecretResourcePoolType, { name: 'SecretResourcePoolType' })

export enum SecretResourcePoolModel {
  InfoSec = 'InfoSec',
  AiSiNo = 'AiSiNo',
  FlkSec = 'FlkSec',
  HaiTai = 'HaiTai'
}
registerEnumType(SecretResourcePoolModel, { name: 'SecretResourcePoolModel' })

export enum ConnectionModeEnum {
  DynamicCentralizedAllocation = 1, // 动态平均分配
  StaticAverageAllocation, // 静态平均分配
  StaticCentralizedAllocation, // 静态集中分配
  StaticPolling // 静态轮询
}
registerEnumType(ConnectionModeEnum, { name: 'ConnectionModeEnum' })

//ukey类型
export enum SecretResourceUKeyType {
  ZJCAWhite = 'ZJCAWhite',
  ZJCABlue = 'ZJCABlue',
  HaiTai = 'HaiTai'
}
registerEnumType(SecretResourceUKeyType, {
  name: 'SecretResourceUKeyType'
})

export enum SecurityMachineKeyType {
  Active = 'Active',
  Protect = 'Protect',
  Hmac = 'Hmac',
  EncryptPublicKey = 'EncryptPublicKey',
  EncryptSubjectDN = 'EncryptSubjectDN'
}
registerEnumType(SecurityMachineKeyType, { name: 'SecurityMachineKeyType' })

@ObjectType()
export class SecurityMachineForSecretResourcePool {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  state: string

  @Field(() => String)
  status: string
}

@ObjectType()
export class SecretResourcePool {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SecretResourcePoolState)
  declare state: SecretResourcePoolState

  @Field(() => SecurityMachineType)
  declare type: SecurityMachineType

  @Field(() => String, { nullable: true })
  activatedToken?: string

  @Field(() => String, { nullable: true })
  protectToken?: string

  @Field(() => String, { nullable: true })
  hmacToken?: string

  @Field(() => SecretResourcePoolStatus, { nullable: true })
  status?: SecretResourcePoolStatus

  @Field(() => SecretResourcePoolModel)
  declare model: SecretResourcePoolModel

  @Field(() => SecretResourceUKeyType, { nullable: true })
  ukeyType?: SecretResourceUKeyType

  @Field(() => ConnectionModeEnum, { nullable: true })
  declare connectionMode?: ConnectionModeEnum

  @Field(() => Boolean)
  isEnableCryptoCmpl: boolean

  @Field(() => [SecurityMachineForSecretResourcePool], { nullable: true })
  securityMachine?: SecurityMachineForSecretResourcePool[]

  @Field(() => String, { nullable: true })
  heartbeatInterval?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class SecretResourcePoolList {
  @Field(() => [SecretResourcePool], { defaultValue: [] })
  list?: SecretResourcePool[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class CheckSyncInput {
  @Field(() => String)
  uuid: string

  @Field(() => SecurityMachineKeyType)
  declare type: SecurityMachineKeyType

  @Field(() => String)
  tokenName: string

  @Field(() => Boolean, { nullable: true })
  dryRun?: boolean
}
