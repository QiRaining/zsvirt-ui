import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

import { ZSVBackupStorageActionModule } from './action/_module'
import { QueryZSVBackupStorageService } from './query/zsv-backup-storage-query'
import {
  ZSVBackupStorageOfBackupJobSummaryResolver,
  ZSVBackupStorageResolver
} from './zsv-backup-storage.resolver'
@Module({
  imports: [
    ZSVBackupStorageActionModule,
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    OwnerModule
  ],
  providers: [
    ZSVBackupStorageResolver,
    QueryZSVBackupStorageService,
    ZSVBackupStorageOfBackupJobSummaryResolver
  ]
})
export class ZSVBackupStorageModule {}
