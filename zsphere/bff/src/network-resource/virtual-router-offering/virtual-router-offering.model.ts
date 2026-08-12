import { Field, Float, Int, ObjectType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { Image } from '@/zsphere-resource/image/image.model'

@ObjectType()
export class VirtualRouterOffering {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => Int)
  cpuNum: number

  @Field(() => Int, { nullable: true })
  cpuSpeed?: number

  @Field(() => Float)
  memorySize: number

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Int, { nullable: true, description: '排序主键' })
  sortKey?: number

  @Field(() => String, { nullable: true, description: '分配策略' })
  allocatorStrategy?: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => String)
  state: string

  @Field(() => String, { description: '区域UUID' })
  zoneUuid: string

  @Field(() => Boolean, { nullable: true })
  isDefault?: boolean

  @Field(() => Boolean, { description: '是否全局共享' })
  toPublic: boolean

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { description: '管理L3网络UUID', nullable: true })
  managementNetworkUuid?: string

  @Field(() => L3Network, { description: '管理L3网络', nullable: true })
  managementNetwork?: L3Network

  @Field(() => String, { description: '公有L3网络UUID' })
  publicNetworkUuid: string

  @Field(() => L3Network, { description: '公有L3网络', nullable: true })
  publicNetwork?: L3Network

  @Field(() => String, { description: '镜像UUID', nullable: true })
  imageUuid?: string

  @Field(() => Image, { description: '镜像', nullable: true })
  image?: Image
}

@ObjectType()
export class VirtualRouterOfferingQueryResp extends QueryCommonResponse(VirtualRouterOffering) {}

@ObjectType()
export class BackupDataFormImageStorage {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  version?: string

  @Field(() => String)
  createdTime: string

  @Field(() => String, { nullable: true })
  md5?: string

  @Field(() => String, { nullable: true })
  installPath?: string

  @Field(() => String)
  uuid: string
}

@ObjectType()
export class BackupDataFormImageStorageResp extends QueryCommonResponse(
  BackupDataFormImageStorage
) {}
