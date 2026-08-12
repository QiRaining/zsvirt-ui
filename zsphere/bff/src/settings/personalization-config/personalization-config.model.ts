import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql'

export enum ProfileType {
  QuickLinkDisableConfig = 'QuickLinkDisableConfig',
  TableColumnWidth = 'TableColumnWidth',
  CustomColumns = 'CustomColumns',
  HomepageLayoutConfig = 'HomepageLayoutConfig',
  WelcomeConfig = 'WelcomeConfig',
  ResourceUpgradeConfig = 'ResourceUpgradeConfig',
  OverviewLayoutConfig = 'OverviewLayoutConfig',
  MonitoringLayoutConfig = 'MonitoringLayoutConfig',
  MonitoringItemsConfig = 'MonitoringItemsConfig'
}

registerEnumType(ProfileType, {
  name: 'ProfileType'
})

@ArgsType()
export class PersonalizationConfigInput {
  @Field(() => ProfileType, { description: '配置类型' })
  profileType: ProfileType

  @Field(() => String, { description: '资源类型' })
  resourceType: string
}

@ObjectType()
export class PersonalizationConfig {
  @Field(() => String, { nullable: true })
  userId: string

  @Field(() => ProfileType, { description: '配置类型' })
  profileType: ProfileType

  @Field(() => String, { description: '资源类型' })
  resourceType: string

  @Field(() => String, { nullable: true })
  value?: string
}
