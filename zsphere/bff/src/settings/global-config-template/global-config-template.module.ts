import { Module } from '@nestjs/common'

import { GlobalConfigTemplateQueryService } from './global-config-template-query/global-config-template-query.service'
import { GlobalConfigTemplateDataloader } from './global-config-template.dataloader'

@Module({
  providers: [GlobalConfigTemplateQueryService, GlobalConfigTemplateDataloader],
  exports: [GlobalConfigTemplateDataloader]
})
export class GlobalConfigTemplateModule {}
