import { Module } from '@nestjs/common'

import { BatchUpdateResourceConfigService } from './batch-update'
import { UpdateResourceConfigService } from './update-resource-config'
import { UpdateResourceConfigsService } from './update-resource-configs'

@Module({
  providers: [
    UpdateResourceConfigService,
    UpdateResourceConfigsService,
    BatchUpdateResourceConfigService
  ],
  exports: []
})
export class ResourceConfigActionModule {}
