import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { GlobalConfigTemplateDataloader } from '../global-config-template/global-config-template.dataloader'
import { GlobalConfigTemplate } from '../global-config-template/global-config-template.model'
import { GlobalConfigDataloader } from '../global-config/global-config.dataloader'
import { GlobalConfig } from '../global-config/global-config.model'
import { TemplateConfigQueryService } from './template-config-query/template-config-query.service'
import {
  QueryTemplateConfigArgs,
  TemplateConfig,
  TemplateConfigList
} from './template-config.model'

@Resolver(() => TemplateConfig)
export class TemplateConfigResolver {
  @Inject() templateConfigQueryService: TemplateConfigQueryService
  @Inject() globalConfigTemplateDataloader: GlobalConfigTemplateDataloader
  @Inject() globalConfigDataloader: GlobalConfigDataloader

  @Query(() => TemplateConfigList)
  async templateConfigList(@Args() queryArgs: QueryTemplateConfigArgs) {
    return this.templateConfigQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async uuid(@Parent() templateConfig: TemplateConfig) {
    return `${templateConfig.templateUuid}.${templateConfig.category}.${templateConfig.name}`
  }

  @ResolveField(() => GlobalConfigTemplate)
  async globalConfigTemplate(@Parent() templateConfig: TemplateConfig) {
    return await this.globalConfigTemplateDataloader.query(templateConfig.templateUuid)
  }

  @ResolveField(() => GlobalConfig)
  async globalConfig(@Parent() templateConfig: TemplateConfig) {
    return await this.globalConfigDataloader.query(templateConfig.name, templateConfig.category)
  }
}
