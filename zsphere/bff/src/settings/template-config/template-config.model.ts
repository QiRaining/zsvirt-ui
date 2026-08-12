import { ObjectType, Field, ArgsType, Int } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

import { GlobalConfigTemplate } from '../global-config-template/global-config-template.model'
import { GlobalConfig } from '../global-config/global-config.model'

@ArgsType()
export class QueryTemplateConfigArgs extends QueryAction {
  @Field(() => String, { nullable: true, defaultValue: 'templateUuid' })
  declare sortBy?: string
}

@ObjectType()
export class TemplateConfig {
  @Field(() => String)
  category: string

  @Field(() => String)
  defaultValue: string

  @Field(() => String)
  name: string

  @Field(() => String)
  value: string

  @Field(() => String)
  templateUuid: string

  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => GlobalConfig, { nullable: true })
  globalConfig?: GlobalConfig

  @Field(() => GlobalConfigTemplate, { nullable: true })
  globalConfigTemplate?: GlobalConfigTemplate
}

@ObjectType()
export class TemplateConfigList {
  @Field(() => [TemplateConfig], { defaultValue: [] })
  list?: TemplateConfig[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
