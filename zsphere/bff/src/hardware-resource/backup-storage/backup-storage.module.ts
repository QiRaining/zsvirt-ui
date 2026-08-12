import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { BackupStorageDataloader } from '@/hardware-resource/backup-storage/backup-storage.dataloader'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { BSActionModule } from './action/_module'
import { BackupStorageResolver, BackupStorageSummaryResolver } from './backup-storage.resolver'
import { BackupStorageService } from './backup-storage.service'

@Module({
  imports: [
    BSActionModule,

    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    BackupStorageResolver,
    BackupStorageSummaryResolver,
    BackupStorageService,
    BackupStorageDataloader
  ],
  exports: [BackupStorageDataloader, BackupStorageService]
})
export class BackupStorageModule {}
