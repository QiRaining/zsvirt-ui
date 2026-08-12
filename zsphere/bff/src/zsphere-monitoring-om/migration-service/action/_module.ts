import { Module } from '@nestjs/common'

import { CleanStoragePackageService } from './clean-storage-package'
import { CleanUpgradeSoftwarePackageService } from './clean-upgrade'
import { DeleteMigrationGatewayVmService } from './delete-gateway-vm'
import { InstallMigrationServiceService } from './install'
import { UpgradeMigrationServiceService } from './upgrade'
import { AddMigrationServicePackageService } from './upload/add-migration-service-package'
import { AddVddkPackageService } from './upload/add-vddk-package'
import LongJobExtend from './upload/long-job-extend'

@Module({
  providers: [
    AddMigrationServicePackageService,
    AddVddkPackageService,
    LongJobExtend,
    InstallMigrationServiceService,
    UpgradeMigrationServiceService,
    CleanUpgradeSoftwarePackageService,
    DeleteMigrationGatewayVmService,
    CleanStoragePackageService
  ],
  exports: []
})
export class MigrationServiceActionModule {}
