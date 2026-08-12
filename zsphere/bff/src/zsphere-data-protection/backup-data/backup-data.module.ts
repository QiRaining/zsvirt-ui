import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { ClusterModule } from '@/hardware-resource/cluster/cluster.module'
import { PrimaryStorageModule } from '@/hardware-resource/primary-storage/primary-storage.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { InstanceOfferingModule } from '@/zsphere-resource/instance-offering/instance-offering.module'
import { VmInstanceModule } from '@/zsphere-resource/vm-instance/vm-instance.module'
import { VolumeModule } from '@/zsphere-resource/volume/volume.module'

import { BackupDataActionModule } from './action/_module'
import { DeleteDatabaseBackupDataService } from './action/delete-database-backup-data'
import { SyncDatabaseBackupToRemoteService } from './action/sync-to-database-remote'
import { BackupDataQueryService } from './backup-data-query/backup-data-query.service'
import {
  BackupDatabaseResolver,
  BackupDataResolver,
  BackupResourceDataResolver,
  VolumeBackupDataSummaryResolver
} from './backup-data.resolver'
import { BackupDataFormImageStorageResolver } from './backup-data.resolver'
import { BackupDataService } from './backup-data.service'
// import { RecoverDatabaseWebSocketClient } from './port-web-socket'
import { BackupSourceDataQueryService } from './backup-source-data-query/backup-source-data-query.service'
import { DatabaseBackupQueryService } from './database-backup-query/database-backup-query.service'

@Module({
  imports: [
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    BackupDataActionModule,
    OwnerModule,
    ClusterModule,
    L3NetworkModule,
    InstanceOfferingModule,
    VmInstanceModule,
    VolumeModule,
    PrimaryStorageModule,
    ClusterModule
  ],
  providers: [
    BackupDataService,
    BackupDataResolver,
    BackupDatabaseResolver,
    VolumeBackupDataSummaryResolver,
    BackupResourceDataResolver,
    SyncDatabaseBackupToRemoteService,
    DeleteDatabaseBackupDataService,
    BackupSourceDataQueryService,
    BackupDataQueryService,
    DatabaseBackupQueryService,
    BackupDataFormImageStorageResolver,
    PubSubService
  ]
})
export class BackupDataModule {}
