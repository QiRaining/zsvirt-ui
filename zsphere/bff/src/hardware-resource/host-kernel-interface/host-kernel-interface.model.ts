import { ArgsType, Field, Int, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { UsedIp } from '@/zsphere-resource/vm-nic/vm-nic.model'

import { HostVO } from '../host/host.model'

export enum HostKernelInterfaceQueryType {
  Normal = 'Normal'
}
registerEnumType(HostKernelInterfaceQueryType, {
  name: 'HostKernelInterfaceQueryType'
})
@ArgsType()
export class QueryHostKernelInterfaceArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => HostKernelInterfaceQueryType, {
    nullable: true,
    defaultValue: HostKernelInterfaceQueryType.Normal
  })
  declare type?: HostKernelInterfaceQueryType
}

export enum KernelTrafficTypes {
  Management = 'Management',
  Storage = 'Storage'
}

registerEnumType(KernelTrafficTypes, {
  name: 'KernelTrafficTypes'
})

@ObjectType()
export class HostKernelInterface {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [KernelTrafficTypes], { nullable: true })
  trafficTypes?: KernelTrafficTypes[]

  @Field(() => String, { nullable: true })
  l2NetworkUuid?: string

  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => L3Network, { nullable: true })
  l3Network?: L3Network

  @Field(() => [UsedIp], { nullable: true })
  usedIps?: UsedIp[]

  @Field(() => Boolean, { nullable: true })
  isDefault?: boolean

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => HostVO, { nullable: true })
  host?: HostVO
}

@ObjectType()
export class HostKernelInterfaceList {
  @Field(() => [HostKernelInterface], { defaultValue: [] })
  list?: HostKernelInterface[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
