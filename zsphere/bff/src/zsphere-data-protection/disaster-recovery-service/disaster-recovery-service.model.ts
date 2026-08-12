import { Field, InputType, ObjectType } from '@nestjs/graphql'

import { ActionInput } from '@/common/model/action.model'

@ObjectType()
export class DisasterRecoveryServiceTarget {
  @Field(() => String)
  clusterName: string

  @Field(() => String)
  hostName: string

  @Field(() => String)
  storageName: string

  @Field(() => String)
  managementNetwork: string

  @Field(() => String)
  spec: string
}

@ObjectType()
export class DisasterRecoveryPlatformContext {
  @Field(() => String)
  platformType: string

  @Field(() => String)
  managementNodeAddress: string

  @Field(() => String)
  managementNodeUuid: string

  @Field(() => String)
  siteId: string

  @Field(() => String)
  suggestedSiteName: string

  @Field(() => String)
  certificateFingerprint: string

  @Field(() => String)
  bootstrapTokenState: string

  @Field(() => String)
  entrySource: string
}

@ObjectType()
export class DisasterRecoveryServiceHealthItem {
  @Field(() => String)
  code: string

  @Field(() => String)
  status: string
}

@ObjectType()
export class DisasterRecoveryServiceBlocker {
  @Field(() => String)
  code: string

  @Field(() => Number)
  count: number
}

@ObjectType()
export class DisasterRecoveryServiceTaskLog {
  @Field(() => String)
  id: string

  @Field(() => String)
  code: string

  @Field(() => String)
  status: string

  @Field(() => String)
  createdAt: string
}

@ObjectType()
export class DisasterRecoveryServiceState {
  @Field(() => String)
  status: string

  @Field(() => String)
  version: string

  @Field(() => String)
  managementAddress: string

  @Field(() => String)
  licenseSummary: string

  @Field(() => String, { nullable: true })
  packageName?: string

  @Field(() => String, { nullable: true })
  packageVersion?: string

  @Field(() => String, { nullable: true })
  packageChecksum?: string

  @Field(() => String, { nullable: true })
  packageUrl?: string

  @Field(() => String, { nullable: true })
  localFileName?: string

  @Field(() => String, { nullable: true })
  storagePath?: string

  @Field(() => String, { nullable: true })
  uploadMethod?: string

  @Field(() => DisasterRecoveryServiceTarget)
  target: DisasterRecoveryServiceTarget

  @Field(() => DisasterRecoveryPlatformContext)
  platformContext: DisasterRecoveryPlatformContext

  @Field(() => [DisasterRecoveryServiceHealthItem])
  selfChecks: DisasterRecoveryServiceHealthItem[]

  @Field(() => [DisasterRecoveryServiceBlocker])
  blockers: DisasterRecoveryServiceBlocker[]

  @Field(() => [DisasterRecoveryServiceTaskLog])
  taskLogs: DisasterRecoveryServiceTaskLog[]
}

@InputType()
export class RunDisasterRecoveryServiceActionPayload {
  @Field(() => String)
  operation: string

  @Field(() => String, { nullable: true })
  packageName?: string

  @Field(() => String, { nullable: true })
  packageVersion?: string

  @Field(() => String, { nullable: true })
  checksum?: string

  @Field(() => String, { nullable: true })
  packageUrl?: string

  @Field(() => String, { nullable: true })
  localFileName?: string

  @Field(() => String, { nullable: true })
  storagePath?: string

  @Field(() => String, { nullable: true })
  uploadMethod?: string

  @Field(() => String, { nullable: true })
  clusterName?: string

  @Field(() => String, { nullable: true })
  hostName?: string

  @Field(() => String, { nullable: true })
  storageName?: string

  @Field(() => String, { nullable: true })
  managementNetwork?: string

  @Field(() => String, { nullable: true })
  spec?: string

  @Field(() => String, { nullable: true })
  managementAddress?: string

  @Field(() => String, { nullable: true })
  siteName?: string

  @Field(() => String, { nullable: true })
  siteId?: string

  @Field(() => String, { nullable: true })
  managementNodeAddress?: string

  @Field(() => String, { nullable: true })
  certificateFingerprint?: string

  @Field(() => String, { nullable: true })
  bootstrapToken?: string
}

@InputType()
export class RunDisasterRecoveryServiceActionInput {
  @Field(() => RunDisasterRecoveryServiceActionPayload)
  payload: RunDisasterRecoveryServiceActionPayload

  @Field(() => ActionInput)
  action: ActionInput
}
