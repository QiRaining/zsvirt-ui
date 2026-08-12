import { ArgsType, Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

export enum BaremetalPxeServerQueryType {
  Normal = 'Normal',
  ClusterAttachablePxeServer = 'ClusterAttachablePxeServer'
}

registerEnumType(BaremetalPxeServerQueryType, {
  name: 'BaremetalPxeServerQueryType'
})

export enum BaremetalPxeServerStatus {
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnected = 'Disconnected'
}

registerEnumType(BaremetalPxeServerStatus, {
  name: 'BaremetalPxeServerStatus'
})

@ArgsType()
export class QueryClusterArgs extends QueryAction {
  @Field(() => BaremetalPxeServerQueryType, { nullable: true })
  declare type?: BaremetalPxeServerQueryType
}

@ObjectType()
export class BaremetalPxeServer {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [String], { nullable: true })
  attachedClusterUuids?: string[]

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  dhcpInterface?: string

  @Field(() => String, { nullable: true })
  sshPort?: string

  @Field(() => String, { nullable: true })
  dhcpRangeBegin?: string

  @Field(() => String, { nullable: true })
  dhcpRangeEnd?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => BaremetalPxeServerStatus, { nullable: true })
  status?: BaremetalPxeServerStatus

  @Field(() => String, { nullable: true })
  storagePath: string

  @Field(() => String, { nullable: true })
  totalCapacity: string

  @Field(() => String, { nullable: true })
  availableCapacity: string

  @Field(() => String, { nullable: true })
  hostname: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string
}

@ObjectType()
export class BaremetalPxeServerQueryResp {
  @Field(() => [BaremetalPxeServer], { nullable: true })
  list?: BaremetalPxeServer[]

  @Field(() => Int, { nullable: true })
  total?: number
}
