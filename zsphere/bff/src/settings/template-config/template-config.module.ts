import { Module } from '@nestjs/common'

import { GlobalConfigTemplateModule } from '../global-config-template/global-config-template.module'
import { GlobalConfigModule } from '../global-config/global-config.module'
import { TemplateConfigQueryService } from './template-config-query/template-config-query.service'
import { TemplateConfigResolver } from './template-config.resolver'

@Module({
  imports: [GlobalConfigTemplateModule, GlobalConfigModule],
  providers: [TemplateConfigQueryService, TemplateConfigResolver]
})
export class TemplateConfigModule {}
