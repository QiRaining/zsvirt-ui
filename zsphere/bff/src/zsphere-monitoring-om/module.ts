import { Module } from '@nestjs/common'

import { LogCollectModule } from './log-collect/log-collect.module'
import { MigrationServiceModule } from './migration-service/migration-service.module'
import { ResourceAttributeModule } from './resource-attribute/resource-attribute.module'
import { ScriptLibraryModule } from './script-library/script-library.module'
import { XmlHookModule } from './xml-hook/xml-hook.module'
import { ZceXTestConnectionModule } from './zwatch-alarm/zcex-test-connection.module'

@Module({
  imports: [
    ResourceAttributeModule,
    LogCollectModule,
    ZceXTestConnectionModule,
    XmlHookModule,
    ScriptLibraryModule,
    MigrationServiceModule
  ],
  providers: []
})
export class MonitoringOMModule {}
