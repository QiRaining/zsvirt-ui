import { ArgsType, Field, Int, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import {
  SecurityGroupRuleProtocolType,
  SecurityGroupRuleState,
  SecurityGroupRuleType,
  SecurityGroupState
} from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { CommonOwner } from '@/zsphere-administration/owner/owner.model'

import { SecurityGroupRulePolicy } from './action/create'

export enum SecurityGroupQueryType {
  Normal = 'Normal',
  ALL = 'ALL',
  Account = 'Account',
  GetVmNicCandidateSecurityGroup = 'GetVmNicCandidateSecurityGroup',
  GetIAM2ProjectCandidateDefaultSecurityGroup = 'GetIAM2ProjectCandidateDefaultSecurityGroup'
}
registerEnumType(SecurityGroupQueryType, { name: 'SecurityGroupQueryType' })

@ArgsType()
export class QuerySecurityGroupArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => SecurityGroupQueryType, {
    nullable: true,
    defaultValue: SecurityGroupQueryType.Normal
  })
  declare type?: SecurityGroupQueryType
}

@ObjectType()
export class RemoteSecurityGroup {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string
}

@ObjectType()
export class SecurityGroupRule {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  securityGroupUuid?: string

  @Field(() => SecurityGroupRuleType, { nullable: true })
  type?: SecurityGroupRuleType

  @Field(() => Int, { nullable: true })
  ipVersion?: number

  @Field(() => Int, { nullable: true })
  startPort?: number

  @Field(() => Int, { nullable: true })
  endPort?: number

  @Field(() => SecurityGroupRuleProtocolType, { nullable: true })
  protocol?: SecurityGroupRuleProtocolType

  @Field(() => SecurityGroupRuleState, { nullable: true })
  state?: SecurityGroupRuleState

  @Field(() => String, { nullable: true })
  allowedCidr?: string

  @Field(() => String, { nullable: true })
  remoteSecurityGroupUuid?: string

  @Field(() => RemoteSecurityGroup, { nullable: true })
  remoteSecurityGroup?: RemoteSecurityGroup

  @Field(() => Int, { nullable: true })
  priority?: number

  @Field(() => SecurityGroupRulePolicy, { nullable: true })
  action?: SecurityGroupRulePolicy

  @Field(() => String, { nullable: true })
  srcIpRange?: string

  @Field(() => String, { nullable: true })
  dstIpRange?: string

  @Field(() => String, { nullable: true })
  srcPortRange?: string

  @Field(() => String, { nullable: true })
  dstPortRange?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class SecurityGroup {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SecurityGroupState, { nullable: true })
  state?: SecurityGroupState

  @Field(() => Int, { nullable: true })
  ipVersion?: number

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [String], { nullable: true })
  attachedL3NetworkUuids?: string[]

  @Field(() => [SecurityGroupRule], { nullable: true })
  rules?: SecurityGroupRule[]

  @Field(() => String, { nullable: true })
  projectUuid?: string

  @Field(() => Int)
  vmNicCount: number

  @Field(() => CommonOwner, { nullable: true })
  owner?: CommonOwner

  @Field(() => Int, { nullable: true }) // 网卡设置安全组使用
  priority?: number
}

@ObjectType()
export class SecurityGroupList {
  @Field(() => [SecurityGroup], { defaultValue: [], nullable: true })
  list?: SecurityGroup[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class SecurityGroupRuleList {
  @Field(() => [SecurityGroupRule], { defaultValue: [], nullable: true })
  list?: SecurityGroupRule[]

  @Field(() => Int, { nullable: true })
  total?: number
}
