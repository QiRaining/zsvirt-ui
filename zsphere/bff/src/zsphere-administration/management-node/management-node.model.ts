import { Field, Float, ObjectType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class ManagementNode {
  @Field(() => String)
  dbStatus: string

  @Field(() => String)
  vip: string

  @Field(() => Boolean)
  gwReachable: boolean

  @Field(() => String)
  mnStatus: string

  @Field(() => String)
  ip: string

  @Field(() => Boolean)
  ownsVip: boolean

  @Field(() => Boolean)
  peerReachable: boolean

  @Field(() => Boolean)
  slaveIoRunning: boolean

  @Field(() => Boolean)
  slaveSqlRuning: boolean

  @Field(() => Float, { nullable: true })
  timeToSyncDB?: number

  @Field(() => Boolean)
  vipReachable: boolean
}

@ObjectType()
export class ManagementNodeQueryResp extends QueryCommonResponse(ManagementNode) {}

@ObjectType()
export class DoubleManagementNodeInfo {
  @Field(() => [String])
  hostNameList: string[]

  @Field(() => Boolean)
  isDualManagementNode: boolean

  @Field(() => [String])
  statusList: string[]

  @Field(() => Boolean)
  isManagementNodeLegal: boolean

  @Field(() => [String], { nullable: true })
  hostListForGetLicenseInfo?: string[]
}
@ObjectType()
export class ManagementNodeIp {
  @Field(() => String)
  ip: string
}

@ObjectType()
export class ManagementNodeError {
  @Field(() => String)
  code: string

  @Field(() => String)
  description: string

  @Field(() => String, { nullable: true })
  details?: string

  @Field(() => [String], { nullable: true })
  causes?: string[]
}

@ObjectType()
export class ManagementNodeStatusItem {
  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  managementsNodeStatus?: string

  @Field(() => String, { nullable: true })
  databaseStatus?: string

  @Field(() => String, { nullable: true })
  gatewayIp?: string

  @Field(() => Boolean, { nullable: true })
  gatewayReachable?: boolean

  @Field(() => String, { nullable: true })
  haMonitorStatus?: string

  @Field(() => String, { nullable: true })
  keepalivedStatus?: string

  @Field(() => Boolean, { nullable: true })
  ownsVip?: boolean

  @Field(() => Boolean, { nullable: true })
  peerReachable?: boolean

  @Field(() => Boolean, { nullable: true })
  slaveIoRunning?: boolean

  @Field(() => Boolean, { nullable: true })
  slaveSqlRunning?: boolean

  @Field(() => String, { nullable: true })
  uiStatus?: string

  @Field(() => Boolean, { nullable: true })
  vipReachable?: boolean

  @Field(() => ManagementNodeError, { nullable: true })
  error?: ManagementNodeError
}

@ObjectType()
export class ManagementNodesStatus {
  @Field(() => [ManagementNodeStatusItem])
  nodes: ManagementNodeStatusItem[]

  @Field(() => String, { nullable: true })
  vip?: string

  @Field(() => String, { nullable: true })
  uiHttpPath?: string
}
