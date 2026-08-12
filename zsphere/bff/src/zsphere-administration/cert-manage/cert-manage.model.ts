import { ObjectType, InputType, Field, Int } from '@nestjs/graphql'

import { ActionInput } from '@/common/model/action.model'

@InputType()
export class CertResetInput {
  @Field(() => String)
  payload: string

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
export class CertUploadInfoPayload {
  @Field(() => String)
  pub: string
  @Field(() => String)
  pri: string
  @Field(() => String, { nullable: true })
  chain?: string
  @Field(() => Boolean)
  redirect: boolean
}

@InputType()
export class CertUploadInfoInput {
  @Field(() => CertUploadInfoPayload)
  payload: CertUploadInfoPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
export class GenNewPemPayload {
  @Field(() => String, { nullable: true })
  duration?: string
  @Field(() => Boolean, { nullable: true })
  redirect?: boolean
  @Field(() => String, { nullable: true })
  CN?: string
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
}

@InputType()
export class GenNewPemInput {
  @Field(() => GenNewPemPayload)
  payload: GenNewPemPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@ObjectType()
export class CurrentConfigure {
  @Field(() => Boolean)
  isDefault: boolean
  @Field(() => String, { nullable: true })
  currentPath?: string
}

@ObjectType()
export class CertInfo {
  @Field(() => String, { nullable: true })
  issueTime?: string
  @Field(() => String, { nullable: true })
  duration?: string
  @Field(() => Boolean, { nullable: true })
  https?: boolean
  @Field(() => Boolean, { nullable: true })
  validating?: boolean
  @Field(() => String, { nullable: true })
  expireTime?: string
  @Field(() => String, { nullable: true })
  uploadTime?: string
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

@InputType()
export class SelfCert {}
