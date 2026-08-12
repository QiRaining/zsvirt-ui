import { Field, ObjectType, Int, ArgsType, registerEnumType, Float } from '@nestjs/graphql'

export enum QueryWidgetUserInfoType {
  Admin = 'Admin',
  Project = 'Project',
  Account = 'Account',
  OrganizationOperator = 'OrganizationOperator'
}
registerEnumType(QueryWidgetUserInfoType, {
  name: 'QueryWidgetUserInfoType'
})

export enum QuerySummaryUserInfoType {
  IAM2 = 'IAM2',
  IAM1 = 'IAM1'
}
registerEnumType(QuerySummaryUserInfoType, {
  name: 'QuerySummaryUserInfoType'
})

@ArgsType()
@ObjectType()
export class QueryWidgetUserInfoArgs {
  @Field(() => QueryWidgetUserInfoType, { nullable: true })
  queryType: QueryWidgetUserInfoType

  @Field(() => String, { nullable: true })
  accountUuid?: string

  @Field(() => String, { nullable: true })
  virtualID?: string

  @Field(() => String, { nullable: true })
  projectUuid?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string
}

@ObjectType()
export class WidgetUserInfo {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  accountNum?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  projectNum?: number

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  platformTime?: number

  @Field(() => String, { nullable: true })
  projectName?: string

  @Field(() => Int, { nullable: true })
  userInProjectNum?: number

  @Field(() => String, { nullable: true })
  identity?: string

  @Field(() => String, { nullable: true })
  projectAdminName?: string

  @Field(() => Int, { nullable: true })
  virtualIDCount?: number
}

@ArgsType()
export class QuerySummaryUserInfoArgs {
  @Field(() => QuerySummaryUserInfoType, { nullable: true })
  type: QuerySummaryUserInfoType
}

@ObjectType()
export class SummaryUserInfo {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  platformAdminNum?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  normalUserNum?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  accountNum?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  userNum?: number
}
