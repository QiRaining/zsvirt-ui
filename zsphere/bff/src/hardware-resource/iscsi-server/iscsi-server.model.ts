import {
  ObjectType,
  Field,
  Float,
  InputType,
  ArgsType,
  registerEnumType,
  Int
} from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError, ISimpleActionResp } from '@/common/model/action-resp.model'

import { IscsiLun } from '../iscsi-lun/iscsi-lun.model'
import { Zone } from '../zone/zone.model'

export enum IscsiServerQueryType {
  NORMAL = 'NORMAL',
  GET_CLUSTER_ATTACHABLE_ISCSI_SERVER = 'GET_CLUSTER_ATTACHABLE_ISCSI_SERVER'
}

registerEnumType(IscsiServerQueryType, {
  name: 'IscsiServerQueryType'
})

@ArgsType()
export class QueryIscsiServerArgs extends QueryAction {
  @Field(() => IscsiServerQueryType, { nullable: true })
  declare type?: IscsiServerQueryType
}

@ObjectType()
export class IscsiTargetInventory {
  @Field(() => String, { nullable: true })
  iscsiServerUuid: string

  @Field(() => String, { nullable: true })
  iscsiServerAddress?: string

  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  iqn?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => [IscsiLun], { defaultValue: [] })
  iscsiLuns: IscsiLun[]

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class IscsiServerClusterRefInventory {
  @Field(() => Float, { nullable: true })
  id?: number

  @Field(() => String, { nullable: true })
  iscsiServerUuid?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class IscsiServerLUNDeviceUsageInfo {
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  totalLunNum: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description:
      '1，SharedBlock 中 diskUuid 和 lun中 wwid 匹配。2， ScsiLunVmInstanceRef 中关联的有VM'
  })
  usedLunNum: number

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  unusedLunNum: number
}

@ObjectType()
export class IscsiServer {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  port?: string

  @Field(() => String, { nullable: true })
  chapUserName?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => [IscsiTargetInventory], { defaultValue: [] })
  iscsiTargets: IscsiTargetInventory[]

  @Field(() => IscsiServerLUNDeviceUsageInfo, { nullable: true })
  lunDeviceUsageInfo?: IscsiServerLUNDeviceUsageInfo

  @Field(() => [IscsiServerClusterRefInventory], { defaultValue: [] })
  iscsiClusterRefs: IscsiServerClusterRefInventory[]

  @Field(() => [Zone], {
    nullable: true,
    defaultValue: [],
    description: 'iscsi server 挂载集群所在的zone，没有挂载集群则无zone'
  })
  zones: Zone[]

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class IscsiServerList {
  @Field(() => [IscsiServer], { defaultValue: [] })
  list?: IscsiServer[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class IscsiServerActionResp extends ISimpleActionResp {
  @Field(() => IscsiServer, { nullable: true })
  declare result?: IscsiServer
}

@InputType()
export class AddIscsiServerInput {
  @Field(() => String)
  name: string

  @Field(() => String)
  ip: string

  @Field(() => String)
  port: string

  @Field(() => String, { nullable: true })
  chapUserName?: string

  @Field(() => String, { nullable: true })
  chapUserPassword?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string
}

@ObjectType()
export class IscsiServerRelateSummary {
  @Field(() => Float, { defaultValue: 0 })
  vmInstanceCount: number

  @Field(() => Float, { defaultValue: 0 })
  volumeCount: number

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  primaryStorageCount?: number
}

@ArgsType()
export class IscsiServerRelateSummaryArgs {
  @Field(() => [String], { description: 'IscsiServerUuids' })
  uuids: string[]

  @Field(() => [String!], { nullable: true, defaultValue: [] })
  clusterUuids?: string[]

  @Field(() => [String!], { nullable: true, defaultValue: [] })
  wwids?: string[]
}

@ObjectType()
export class IscsiTargetListResponse extends QueryCommonResponse(IscsiTargetInventory) {}
