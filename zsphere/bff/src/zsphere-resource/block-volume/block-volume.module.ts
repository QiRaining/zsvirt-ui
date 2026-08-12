import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { PrimaryStorageModule } from '@/hardware-resource/primary-storage/primary-storage.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

import { VmInstanceDataloader } from '../vm-instance/vm-instance.dataloader'
import { AccessPathResolver, BlockVolumeResolver } from './block-volume.resolver'
import { BlockVolumeService } from './block-volume.service'

@Module({
  imports: [
    OwnerModule,
    PrimaryStorageModule,
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [BlockVolumeResolver, VmInstanceDataloader, BlockVolumeService, AccessPathResolver],
  exports: [BlockVolumeService]
})
export class BlockVolumeModule {}
