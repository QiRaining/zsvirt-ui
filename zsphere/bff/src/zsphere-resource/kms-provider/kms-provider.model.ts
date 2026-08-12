import { ArgsType, Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'

export enum TrustState {
  MUTUAL_UNTRUSTED = 'MUTUAL_UNTRUSTED',
  MN_TRUSTS_KMS_ONLY = 'MN_TRUSTS_KMS_ONLY',
  KMS_TRUSTS_MN_ONLY = 'KMS_TRUSTS_MN_ONLY',
  MUTUAL_TRUSTED = 'MUTUAL_TRUSTED'
}

registerEnumType(TrustState, {
  name: 'TrustState'
})

@ObjectType()
export class KmsIdentity {
  @Field(() => String)
  uuid!: string

  @Field(() => String)
  kmsUuid!: string

  @Field(() => String)
  identityType!: string

  @Field(() => String, { nullable: true })
  clientCertPem?: string

  @Field(() => String, { nullable: true })
  clientKeyPem?: string

  @Field(() => String, { nullable: true })
  csrPem?: string

  @Field(() => String, { nullable: true })
  certExpiredDate?: string

  @Field(() => String, { nullable: true })
  createDate?: string
}

@ObjectType()
export class KmsIdentityListResp {
  @Field(() => [KmsIdentity])
  list!: KmsIdentity[]

  @Field(() => Int)
  total!: number
}

@ObjectType()
export class KmsProvider {
  @Field(() => String)
  uuid!: string

  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  type!: string

  @Field(() => Boolean, { nullable: true })
  isDefault?: boolean

  @Field(() => Boolean, { nullable: true })
  connected?: boolean

  @Field(() => String, { nullable: true })
  endpoint?: string

  @Field(() => Int, { nullable: true })
  port?: number

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => TrustState, { nullable: true })
  trustState?: TrustState

  @Field(() => String, { nullable: true })
  activeIdentityUuid?: string

  @Field(() => KmsIdentity, { nullable: true })
  activeIdentity?: KmsIdentity

  @Field(() => String, { nullable: true })
  serverCertExpiredDate?: string

  @Field(() => String, { nullable: true })
  serverCertPem?: string

  @Field(() => Boolean, { nullable: true })
  backedUp?: boolean

  @Field(() => String, { nullable: true })
  createDate?: string
}

@ObjectType()
export class KmsProviderListResp {
  @Field(() => [KmsProvider])
  list!: KmsProvider[]

  @Field(() => Int)
  total!: number
}

@ObjectType()
export class ParseNkpRestoreInfo {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => BigInt, { nullable: true })
  backupTime?: number
}

@ObjectType()
export class ParseNkpRestoreResult {
  @Field(() => ParseNkpRestoreInfo, { nullable: true })
  restoreInfo?: ParseNkpRestoreInfo

  @Field(() => String, { nullable: true })
  code?: string

  @Field(() => String, { nullable: true })
  reason?: string
}

@ArgsType()
export class ParseNkpRestoreQuery {
  @Field(() => String)
  contentBase64!: string

  @Field(() => String, { nullable: true })
  password?: string
}

@ObjectType()
export class KmsCertInfo {
  @Field(() => String, { nullable: true })
  issueTime?: string
  @Field(() => String, { nullable: true })
  duration?: string
  @Field(() => Boolean, { nullable: true })
  validating?: boolean
  @Field(() => String, { nullable: true })
  expireTime?: string
  @Field(() => String, { nullable: true })
  issueCN?: string
  @Field(() => String, { nullable: true })
  O?: string
  @Field(() => String, { nullable: true })
  OU?: string
  @Field(() => String, { nullable: true })
  C?: string
  @Field(() => String, { nullable: true })
  ST?: string
  @Field(() => String, { nullable: true })
  L?: string
  @Field(() => String, { nullable: true })
  emailAddress?: string
  @Field(() => String, { nullable: true })
  subCN?: string
  @Field(() => String, { nullable: true })
  subO?: string
  @Field(() => String, { nullable: true })
  subOU?: string
  @Field(() => String, { nullable: true })
  subC?: string
  @Field(() => String, { nullable: true })
  subST?: string
  @Field(() => String, { nullable: true })
  subL?: string
  @Field(() => String, { nullable: true })
  subEmailAddress?: string
  @Field(() => String, { nullable: true })
  signatureAlgorithm?: string
  @Field(() => String, { nullable: true })
  version?: string
  @Field(() => String, { nullable: true })
  keyAlgorithm?: string
  @Field(() => String, { nullable: true })
  fingerprint?: string
  @Field(() => String, { nullable: true })
  serial?: string
  @Field(() => Int, { nullable: true })
  bits?: number
}

@ObjectType()
export class GetKmsServerCertFromKmsResult {
  @Field(() => String, { nullable: true })
  serverCertPem?: string

  @Field(() => Boolean, { nullable: true })
  selfSigned?: boolean

  @Field(() => KmsCertInfo, { nullable: true })
  kmsCertInfo?: KmsCertInfo
}
