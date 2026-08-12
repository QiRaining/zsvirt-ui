import { Int, Field, ArgsType, ObjectType, InputType, registerEnumType } from '@nestjs/graphql'

import { AffinityGroupState } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { AccountInfo } from '@/zsphere-administration/scheduler-job/scheduler-job.model'

export enum AffinityGroupStateEvent {
  enable = 'enable',
  disable = 'disable'
}

export enum AffinityGroupPolicyType {
  ANTISOFT = 'ANTISOFT',
  ANTIHARD = 'ANTIHARD'
}

export enum AffinityGroupQueryType {
  Normal = 'Normal',
  GetCandidateAffinityGroupForVmAttaching = 'GetCandidateAffinityGroupForVmAttaching'
}

registerEnumType(AffinityGroupStateEvent, {
  name: 'AffinityGroupStateEvent'
})

registerEnumType(AffinityGroupPolicyType, {
  name: 'AffinityGroupPolicyType'
})

registerEnumType(AffinityGroupQueryType, {
  name: 'AffinityGroupQueryType'
})

@ObjectType()
export abstract class Usage {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  affinityGroupUuid: string

  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  resourceType: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class AffinityGroup {
  @Field(() => String, { description: '资源的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => String, { nullable: true, description: '资源的详细描述' })
  description: string

  @Field(() => AffinityGroupPolicyType, { description: '亲和组策略' })
  policy: AffinityGroupPolicyType

  @Field(() => String, { description: '亲和组分配算法的版本' })
  version: string

  @Field(() => String, { description: '亲和组类型' })
  type: string

  @Field(() => String, { description: '亲和组使用者标识' })
  appliance: string

  @Field(() => AffinityGroupState, { nullable: true })
  state: AffinityGroupState

  @Field(() => String, { nullable: true })
  affinityGroupUuid: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => [Usage])
  usages: Array<Usage>

  @Field(() => AccountInfo, { nullable: true })
  owner: AccountInfo
}

@ObjectType()
export class AffinityGroupList {
  @Field(() => [AffinityGroup])
  list: AffinityGroup[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryAffinityGroupArgs extends QueryAction {
  @Field(() => AffinityGroupQueryType, { nullable: true })
  declare type?: AffinityGroupQueryType
}

@InputType()
export class AddVmInstanceToAffinityGroupInput {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  affinityGroupUuid: string
}

@InputType()
// export class RemoveVmInstanceFromAffinityGroupInput extends PartialType(AddVmInstanceToAffinityGroupInput) {}
export class RemoveVmInstanceFromAffinityGroupInput {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  affinityGroupUuid: string
}

@ObjectType()
export class AffinityGroupActionResp {
  @Field(() => AffinityGroup, { nullable: true })
  result?: AffinityGroup

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
