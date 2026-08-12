import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { CapacityManagementDataloader } from './capacity-management.dataloader'
import {
  CapacityManagementCardResolver,
  CapacityManagementCardPrimaryStorageResolver,
  CapacityManagementTopListHostResolver,
  CapacityManagementTopListPrimaryStorageResolver,
  CapacityManagementTopListBackupStorageResolver,
  CapacityManagementTopListImageResolver,
  CapacityManagementTopListVmInstanceResolver,
  CapacityManagementTopListVolumeResolver,
  CapacityManagementTopListSnapshotResolver,
  CapacityManagementTopListHostDiskInfoResolver,
  CapacityManagementDisconnectedResourceCountResolver,
  CapacityManagementListVMDiskInfoResolver
} from './capacity-management.resolver'
import { CapacityManagementService } from './capacity-management.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [
    CapacityManagementService,
    CapacityManagementCardResolver,
    CapacityManagementCardPrimaryStorageResolver,
    CapacityManagementTopListHostResolver,
    CapacityManagementTopListPrimaryStorageResolver,
    CapacityManagementTopListBackupStorageResolver,
    CapacityManagementTopListImageResolver,
    CapacityManagementTopListVmInstanceResolver,
    CapacityManagementTopListVolumeResolver,
    CapacityManagementTopListSnapshotResolver,
    CapacityManagementTopListHostDiskInfoResolver,
    CapacityManagementDisconnectedResourceCountResolver,
    CapacityManagementDataloader,
    CapacityManagementListVMDiskInfoResolver
  ]
})
export class CapacityManagementModule {}
