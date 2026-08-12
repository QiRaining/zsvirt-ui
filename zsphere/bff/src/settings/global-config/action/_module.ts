import { Module } from '@nestjs/common'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'

import { ResetGlobalConfigService } from './reset-global-config'
import { UpdateGlobalConfigService } from './update-global-config'

@Module({
  providers: [ZStackApiBase, UpdateGlobalConfigService, ResetGlobalConfigService]
})
export class GlobalConfigActionModule {}
