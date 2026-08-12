import { Int, Field, ArgsType, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { HostGroup } from '@/zsphere-resource/host-group/host-group.model'
import { VmGroupBase } from '@/zsphere-resource/vm-group/vm-group-base.model'

export enum VmSchedulingRuleQueryType {
  Normal = 'Normal',
  AssociateVmGroup = 'AssociateVmGroup',
  AssociateHostGroup = 'AssociateHostGroup'
}

registerEnumType(VmSchedulingRuleQueryType, {
  name: 'VmSchedulingRuleQueryType'
})

export enum VmSchedulingRuleState {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}
registerEnumType(VmSchedulingRuleState, {
  name: 'VmSchedulingRuleState'
})

export enum VmSchedulingRuleMode {
  SOFT = 'SOFT',
  HARD = 'HARD'
}
registerEnumType(VmSchedulingRuleMode, {
  name: 'VmSchedulingRuleMode'
})

export enum VmSchedulingRuleRule {
  AFFINITY = 'AFFINITY',
  ANTIAFFINITY = 'ANTIAFFINITY'
}
registerEnumType(VmSchedulingRuleRule, {
  name: 'VmSchedulingRuleRule'
})

@ObjectType()
export class VmSchedulingRule {
  @Field(() => String, { description: '资源的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => String, { nullable: true, description: '资源的详细描述' })
  description?: string

  @Field(() => VmSchedulingRuleMode, { nullable: true })
  mode?: VmSchedulingRuleMode

  @Field(() => VmSchedulingRuleRule, { nullable: true })
  rule?: VmSchedulingRuleRule

  @Field(() => VmSchedulingRuleState, { nullable: true })
  state?: VmSchedulingRuleState

  @Field(() => String, { nullable: true })
  excuteState?: string

  @Field(() => VmGroupBase, { nullable: true })
  vmGroup?: VmGroupBase

  @Field(() => HostGroup, { nullable: true })
  hostGroup?: HostGroup

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => Zone, { nullable: true })
  zone?: Zone
}

@ObjectType()
export class VmSchedulingRuleList {
  @Field(() => [VmSchedulingRule])
  list: VmSchedulingRule[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryVmSchedulingRuleArgs extends QueryAction {
  @Field(() => VmSchedulingRuleQueryType, { nullable: true })
  declare type?: VmSchedulingRuleQueryType
}

@ObjectType()
export class VmSchedulingRuleActionResp {
  @Field(() => VmSchedulingRule, { nullable: true })
  result?: VmSchedulingRule

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class ResourceUpgradeConfig {
  @Field(() => String, { nullable: true })
  userId: string

  @Field(() => String, { nullable: true })
  upgradeConfig: string
}

@InputType()
export class ValidateVmSchedulingRuleParam {
  @Field(() => String)
  mode: string

  @Field(() => String)
  rule: string

  @Field(() => String)
  vmGroupUuid: string

  @Field(() => String, { nullable: true })
  hostGroupUuid?: string
}

@ObjectType()
export class ValidateVmSchedulingRuleResult {
  @Field(() => Boolean, { nullable: true })
  success?: boolean
}
