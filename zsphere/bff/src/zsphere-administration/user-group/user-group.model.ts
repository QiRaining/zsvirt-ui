import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  OmitType,
  registerEnumType
} from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'

import { ZsvRole } from '../zsv-role/zsv-role.model'

export enum UserGroupQueryType {
  Normal = 'Normal',
  GET_USERGROUP_BY_ACCOUNT = 'GET_USERGROUP_BY_ACCOUNT',
  GET_USERGROUP_BY_NOT_ACCOUNT = 'GET_USERGROUP_BY_NOT_ACCOUNT',
  GET_USERGROUP_BY_ROLE = 'GET_USERGROUP_BY_ROLE',
  GET_USERGROUP_BY_SHARED = 'GET_USERGROUP_BY_SHARED',
  GET_USERGROUP_BY_NOT_SHARED = 'GET_USERGROUP_BY_NOT_SHARED'
}
registerEnumType(UserGroupQueryType, {
  name: 'UserGroupQueryType'
})
@ArgsType()
export class QueryUserGroupArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => UserGroupQueryType, {
    nullable: true,
    defaultValue: UserGroupQueryType.Normal
  })
  declare type?: UserGroupQueryType
}

@InputType()
export class UserGroupShareResourceInput {
  @Field(() => String, { nullable: true })
  vmUuids?: string[]

  @Field(() => String, { nullable: true })
  vmTemplateUuids?: string[]

  @Field(() => String, { nullable: true })
  l2NetworkUuids?: string[]

  @Field(() => String, { nullable: true })
  l3NetworkUuids?: string[]

  @Field(() => String, { nullable: true })
  imageUuids?: string[]
}

@ObjectType()
export class UserGroup {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => Int, { nullable: true })
  groupUserCount?: number

  @Field(() => [ZsvRole], { nullable: true })
  role?: ZsvRole[]

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class UserGroupList extends QueryCommonResponse(UserGroup) {}
