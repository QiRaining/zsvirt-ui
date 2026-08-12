import { ArgsType, Field, Float, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum EipQueryType {
  'Normal' = 'Normal',
  'SelectEipByCreateVm' = 'SelectEipByCreateVm',
  GetVmNicAttachableEips = 'GetVmNicAttachableEips'
}

registerEnumType(EipQueryType, {
  name: 'EipQueryType'
})

@ArgsType()
export class QueryEipArgs extends QueryAction {
  @Field(() => EipQueryType, {
    nullable: true,
    defaultValue: EipQueryType.Normal
  })
  declare type?: EipQueryType
}

@ObjectType()
export class EipRelatedResource {
  @Field(() => Float)
  l3PrivateTotal: number

  @Field(() => Float)
  l3PublicTotal: number

  @Field(() => Float)
  l3SystemTotal: number

  @Field(() => Float)
  clusterTotal: number
}

export enum EipState {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}
registerEnumType(EipState, {
  name: 'EipState'
})

@ObjectType()
class EipRelatedVmInstance {
  @Field()
  name?: string

  @Field()
  uuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field({ nullable: true })
  hypervisorType?: string
}

@ObjectType()
export class Eip {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  guestIp?: string

  @Field(() => EipState, { nullable: true })
  state: EipState

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  vipIp: string

  @Field(() => String)
  vipUuid: string

  @Field(() => String, { nullable: true })
  vmNicUuid: string

  @Field(() => EipRelatedVmInstance, { nullable: true })
  vmInstance?: EipRelatedVmInstance
}

@ObjectType()
export class EipListResp {
  @Field(() => [Eip])
  list: Eip[]

  @Field(() => Float)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class UpdateEipInput {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string
}
@InputType()
export class DeleteEipInput {
  @Field(() => [String])
  uuids: string[]

  @Field(() => [String], { nullable: true })
  vipUuids?: string[]
}
