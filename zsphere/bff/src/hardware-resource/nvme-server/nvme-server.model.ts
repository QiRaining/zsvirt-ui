import { ObjectType, Field, Float, ArgsType, registerEnumType, Int } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError, ISimpleActionResp } from '@/common/model/action-resp.model'

import { NVMeLun } from '../nvme-lun/nvme-lun.model'
import { Zone } from '../zone/zone.model'

export enum NvmeServerQueryType {
  NORMAL = 'NORMAL',
  GET_CLUSTER_ATTACHABLE_NVME_SERVER = 'GET_CLUSTER_ATTACHABLE_NVME_SERVER'
}

registerEnumType(NvmeServerQueryType, {
  name: 'NvmeServerQueryType'
})

export enum TransportType {
  RDMA = 'RDMA',
  TCP = 'TCP',
  FC = 'FC'
}

registerEnumType(TransportType, {
  name: 'TransportType'
})

@ArgsType()
export class QueryNvmeServerArgs extends QueryAction {
  @Field(() => NvmeServerQueryType, { nullable: true })
  declare type?: NvmeServerQueryType
}

@ObjectType()
export class NvmeTargetInventory {
  @Field(() => String, { nullable: true })
  nvmeServerUuid: string

  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  nqn?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => [NVMeLun], { defaultValue: [] })
  nvmeLuns: NVMeLun[]

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class NvmeServerClusterRefInventory {
  @Field(() => Float, { nullable: true })
  id?: number

  @Field(() => String, { nullable: true })
  nvmeServerUuid?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class NvmeServer {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  transport: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  port?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => [NvmeTargetInventory], { defaultValue: [] })
  nvmeTargets: NvmeTargetInventory[]

  @Field(() => [NvmeServerClusterRefInventory], { defaultValue: [] })
  nvmeClusterRefs: NvmeServerClusterRefInventory[]

  @Field(() => [Zone], { nullable: true, defaultValue: [] })
  zones: Zone[]

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class NvmeServerList {
  @Field(() => [NvmeServer], { defaultValue: [] })
  list?: NvmeServer[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class NvmeServerActionResp extends ISimpleActionResp {
  @Field(() => NvmeServer, { nullable: true })
  declare result?: NvmeServer
}

@ObjectType()
export class NvmeServerLUNDeviceUsageInfo {
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  totalLunNum: number

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  usedLunNum: number

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  unusedLunNum: number
}
