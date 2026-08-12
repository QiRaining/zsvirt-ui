import { ArgsType, Field, ObjectType, registerEnumType, Int } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum UsedIpQueryType {
  'Normal' = 'Normal',
  'CandidateVmNicForAttachEip' = 'CandidateVmNicForAttachEip'
}

registerEnumType(UsedIpQueryType, {
  name: 'UsedIpQueryType'
})

@ArgsType()
export class QueryUsedIpArgs extends QueryAction {
  @Field(() => UsedIpQueryType, {
    nullable: true,
    defaultValue: UsedIpQueryType.Normal
  })
  declare type?: UsedIpQueryType
}

@ObjectType()
export class VmNicUsedIp {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  ip: string

  @Field(() => String, { nullable: true })
  l3NetworkUuid: string

  @Field(() => String, { nullable: true, description: '静态网络' })
  isStatic: string

  @Field(() => String, { nullable: true })
  vmNicUuid: string

  @Field(() => Int, { nullable: true })
  ipVersion: number

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string
}

@ObjectType()
export class UsedIpListResp {
  @Field(() => [VmNicUsedIp])
  list: VmNicUsedIp[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
