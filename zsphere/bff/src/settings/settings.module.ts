import { Module } from '@nestjs/common'

import { ResourceConfigModule } from '@/settings/resource-config/resource-config.module'

import { CustomColumnsModule } from './custom-columns/custom-columns.module'
import { GlobalConfigTemplateModule } from './global-config-template/global-config-template.module'
import { GlobalConfigModule } from './global-config/global-config.module'
import { HAStrategicModule } from './ha-strategic/ha-strategic.module'
import { PersonalizationConfigModule } from './personalization-config/personalization-config.module'
import { TemplateConfigModule } from './template-config/template-config.module'

@Module({
  imports: [
    ResourceConfigModule,
    GlobalConfigModule,
    TemplateConfigModule,
    GlobalConfigTemplateModule,
    CustomColumnsModule,
    HAStrategicModule,
    PersonalizationConfigModule
  ],
  providers: []
})
export class SettingsModule {}
