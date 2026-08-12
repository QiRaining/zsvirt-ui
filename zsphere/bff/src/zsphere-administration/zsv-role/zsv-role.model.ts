import {
  ArgsType,
  Field,
  Int,
  InputType,
  ObjectType,
  OmitType,
  registerEnumType
} from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'

export enum ZsvRoleQueryType {
  Normal = 'Normal',
  Predefined = 'Predefined',
  Customized = 'Customized',
  GET_ROLE_BY_ACCOUNT = 'GET_ROLE_BY_ACCOUNT',
  GET_ROLE_BY_USERGROUP = 'GET_ROLE_BY_USERGROUP',
  //用于角色列表
  GET_ROLE_FOR_MANAGEMENT = 'GET_ROLE_FOR_MANAGEMENT',
  //用于Account&AccountGroup创建
  GET_ROLE_FOR_MANAGEMENT_WITH_ACCOUNT_AND_USERGROUP = 'GET_ROLE_FOR_MANAGEMENT_WITH_ACCOUNT_AND_USERGROUP',
  //用于SystemAccount创建
  GET_ROLE_FOR_MANAGEMENT_WITH_PREDEFINED_SYSTEM_ACCOUNT = 'GET_ROLE_FOR_MANAGEMENT_WITH_PREDEFINED_SYSTEM_ACCOUNT'
}

registerEnumType(ZsvRoleQueryType, {
  name: 'ZsvRoleQueryType'
})
@ArgsType()
export class QueryZsvRoleArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => ZsvRoleQueryType, {
    nullable: true,
    defaultValue: ZsvRoleQueryType.Normal
  })
  declare type?: ZsvRoleQueryType
}

@InputType()
export class ZsvRolePoliciesInput {
  @Field(() => String)
  effect: string

  @Field(() => [String])
  actions: string[]
}

@ObjectType()
export class ZsvRole {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => [String], { nullable: true, defaultValue: [] })
  policies?: string[]

  @Field(() => ZsvRoleQueryType, { nullable: true })
  type: ZsvRoleQueryType

  @Field(() => String, { nullable: true })
  uiPrivilege?: string

  @Field(() => Int, { nullable: true })
  userCount?: number

  @Field(() => Int, { nullable: true })
  userGroupCount?: number

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class ZsvRoleList extends QueryCommonResponse(ZsvRole) {}

@ObjectType()
export class ZsvRoleUIPrivilege {
  @Field(() => [ZsvRole], { nullable: true })
  systemRoles?: ZsvRole[]

  @Field(() => [ZsvRole], { nullable: true })
  customRoles?: ZsvRole[]

  @Field(() => String, { nullable: true })
  customUIPrivilege?: string
}

@InputType()
export class ZsvRoleUIPrivilegeInput {
  @Field(() => String)
  resourceType: string

  @Field(() => String)
  actionKey: string

  @Field(() => String)
  viewKey: string

  @Field(() => String)
  effect: string

  @Field(() => [String])
  views: string[]

  @Field(() => [String])
  actions: string[]
}
