import { Field, ObjectType, registerEnumType, ArgsType, Int, Float } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { QueryAction } from '@/common/model/action-query.model'
import { CreateActionResp } from '@/common/model/action-resp.model'
import { CCSCertificate } from '@/identity/model/login.model'

import { ZsvRole } from '../zsv-role/zsv-role.model'

export enum AccountQueryType {
  Normal = 'Normal',
  BillingPriceTable = 'BillingPriceTable',
  BillingPriceTableBindCandidate = 'BillingPriceTableBindCandidate',
  GET_ACCOUNT_BY_USERGROUP = 'GET_ACCOUNT_BY_USERGROUP',
  GET_ACCOUNT_BY_ROLE = 'GET_ACCOUNT_BY_ROLE',
  GET_ACCOUNT_BY_SHARED = 'GET_ACCOUNT_BY_SHARED',
  GET_ACCOUNT_BY_NOT_SHARED = 'GET_ACCOUNT_BY_NOT_SHARED',
  GET_ACCOUNT_BY_NOT_USERGROUP = 'GET_ACCOUNT_BY_NOT_USERGROUP'
}
registerEnumType(AccountQueryType, {
  name: 'AccountQueryType'
})

export enum AccountType {
  Normal = 'Normal',
  SystemAdmin = 'SystemAdmin',
  ThirdParty = 'ThirdParty'
}

registerEnumType(AccountType, {
  name: 'AccountType'
})

@ObjectType()
export class Account {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => AccountType, { nullable: true })
  type?: AccountType

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => CCSCertificate, { nullable: true })
  ccsCertificate?: CCSCertificate

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string
}

@ObjectType()
export class AccountQuotaUsage {
  @Field(() => String)
  name: string

  @Field(() => Float, { defaultValue: 0 })
  total: number

  @Field(() => Float, { defaultValue: 0 })
  used: number
}
@ObjectType()
export class AccountQuotaInfo {
  @Field(() => Int, { nullable: true })
  volumeNum: number

  @Field(() => [AccountQuotaUsage], { nullable: true })
  usages: AccountQuotaUsage[]
}

@ObjectType()
export class AccountVO extends Account {
  @Field(() => Int, { nullable: true })
  vmNum: number

  @Field(() => Int, { nullable: true })
  volumeNum: number

  @Field(() => AccountQuotaInfo, { nullable: true })
  accountQuotaInfo: AccountQuotaInfo

  @Field(() => [ZsvRole], { nullable: true })
  role?: [ZsvRole]

  @Field(() => [ZsvRole], { nullable: true })
  roleFromAccountGroup?: [ZsvRole]
}

@ObjectType()
export class AccountResp extends QueryCommonResponse(AccountVO) {
  @Field(() => AccountQueryType, { nullable: true })
  result?: AccountQueryType
}

@ArgsType()
export class QueryAccountArgs extends QueryAction {
  @Field(() => AccountQueryType, { nullable: true })
  declare type?: AccountQueryType
}

@ObjectType()
export class AccountActionResp extends CreateActionResp(AccountVO) {}

@ArgsType()
export class GetAccountQuotaUsageArgs {
  @Field(() => String, { description: 'Account Uuid' })
  uuid: string
}

@ObjectType()
export class GetAccountQuotaUsageResp {
  @Field(() => [AccountQuotaUsage], { nullable: true, defaultValue: [] })
  usages?: AccountQuotaUsage[]
}
