import { Module } from '@nestjs/common'

import { MigrationServiceActionModule } from './action/_module'
import { UploadMigrationServicePackageController } from './action/upload/upload-migration-service-package'
import {
  MigrationServicePackageResolver,
  MigrationServiceInfoResolver,
  ZMigrateRuntimeConfigResolver,
  GatewayVmInstanceResolver
} from './migration-service.resolver'
import { MigrationServiceService } from './migration-service.service'

@Module({
  imports: [MigrationServiceActionModule],
  providers: [
    MigrationServiceService,
    MigrationServicePackageResolver,
    MigrationServiceInfoResolver,
    ZMigrateRuntimeConfigResolver,
    GatewayVmInstanceResolver
  ],
  controllers: [UploadMigrationServicePackageController],
  exports: [MigrationServiceService]
})
export class MigrationServiceModule {}
