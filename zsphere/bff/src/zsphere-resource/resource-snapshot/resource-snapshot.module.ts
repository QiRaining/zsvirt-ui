import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { FlowModule } from '@/common/flow/flow.module'
import { PrimaryStorageDataloader } from '@/hardware-resource/primary-storage/primary-storage.dataloader'
import { PrimaryStorageModule } from '@/hardware-resource/primary-storage/primary-storage.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { VmInstanceModule } from '../vm-instance/vm-instance.module'
import { VolumeModule } from '../volume/volume.module'
import { SnapshotActionModule } from './action/_module'
import { ZSVResourceSnapshotQueryService } from './resource-snapshot-query/zsv-snapshot-query.service'
import {
  SnapshotGroupAvailabilityDataloader,
  SnapshotGroupDataloader,
  SnapshotGroupSizeDataloader
} from './resource-snapshot.dataloader'
import {
  GetSnapshotDeleteNeedSize,
  VolumeSnapshotGroupResolver,
  VolumeSnapshotResolver,
  VolumeSnapshotTreeListResolver,
  ZSVSnapshotGroupByVolumeResolver,
  ZSVSnapshotResolver,
  MemorySnapshotGroupConflictResolver
} from './resource-snapshot.resolver'
import { ResourcesnapshotService } from './resource-snapshot.service'

@Module({
  imports: [
    ZStackApiModule,
    SnapshotActionModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    VolumeModule,
    VmInstanceModule,
    PrimaryStorageModule
  ],
  providers: [
    VolumeSnapshotTreeListResolver,
    VolumeSnapshotResolver,
    VolumeSnapshotGroupResolver,
    ZSVSnapshotGroupByVolumeResolver,
    ZSVResourceSnapshotQueryService,
    ZSVSnapshotResolver,
    GetSnapshotDeleteNeedSize,
    ResourcesnapshotService,
    SnapshotGroupAvailabilityDataloader,
    SnapshotGroupDataloader,
    SnapshotGroupSizeDataloader,
    PrimaryStorageDataloader,
    MemorySnapshotGroupConflictResolver
  ]
})
export class ResourcesnapshotModule {}
