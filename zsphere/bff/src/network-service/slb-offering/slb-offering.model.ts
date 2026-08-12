import { ObjectType, Field, Float, ArgsType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { Image } from '@/zsphere-resource/image/image.model'
import { AllocatorStrategyType } from '@/zsphere-resource/instance-offering/instance-offering.model'

export enum SlbOfferingQueryType {
  NORMAL = 'NORMAL'
}

registerEnumType(SlbOfferingQueryType, {
  name: 'SlbOfferingQueryType'
})

@ArgsType()
export class QuerySlbOfferingArgs extends QueryAction {
  @Field(() => SlbOfferingQueryType, { nullable: true })
  declare type?: SlbOfferingQueryType
}

@ObjectType()
export class SlbOffering {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => Float)
  cpuNum: number

  @Field(() => Float, { nullable: true })
  cpuSpeed?: number

  @Field(() => Float)
  memorySize: number

  @Field(() => String)
  state: string

  @Field(() => AllocatorStrategyType)
  allocatorStrategy: AllocatorStrategyType

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Float, { nullable: true })
  sortKey?: number

  @Field(() => String, { nullable: true })
  imageUuid?: string

  @Field(() => Image, { nullable: true })
  image?: Image

  @Field(() => String, { nullable: true })
  managementNetworkUuid?: string

  @Field(() => L3Network, { nullable: true })
  managementNetwork?: L3Network

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class SlbOfferingList {
  @Field(() => [SlbOffering], { defaultValue: [] })
  list?: SlbOffering[]

  @Field(() => Float)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
