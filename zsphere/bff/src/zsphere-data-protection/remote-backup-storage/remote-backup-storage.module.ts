import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { QueryRemoteBackupStorageService } from './query/remote-backup-storage-query'
import {
  RemoteBackupStorageResolver,
  RemoteBackupStorageSystemTagsResolver
} from './remote-backup-storage.resolver'
@Module({
  imports: [
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    OwnerModule
  ],
  providers: [
    RemoteBackupStorageResolver,
    RemoteBackupStorageSystemTagsResolver,
    QueryRemoteBackupStorageService
  ]
})
export class RemoteBackupStorageModule {}
