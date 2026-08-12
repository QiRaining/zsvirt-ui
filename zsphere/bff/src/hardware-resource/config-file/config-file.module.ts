import { Module, forwardRef } from '@nestjs/common'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { VmInstanceModule } from '@/zsphere-resource/vm-instance/vm-instance.module'

import { ConfigFileResolver } from './config-file.resolver'
import { ConfigFileService } from './config-file.service'

@Module({
  imports: [ZStackApiModule, forwardRef(() => VmInstanceModule)],
  providers: [ConfigFileResolver, ConfigFileService],
  exports: [ConfigFileService]
})
export class ConfigFileModule {}
