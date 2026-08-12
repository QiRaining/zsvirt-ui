import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { AttachDataVolumeToVmAction } from '@/api/zstack/AttachDataVolumeToVmAction'
import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import { CreateDataVolumeAction } from '@/api/zstack/CreateDataVolumeAction'
import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { LongJobService } from '@/common/long-job/long-job.service'
import { PrimaryStorageModule } from '@/hardware-resource/primary-storage/primary-storage.module'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { OperationLogActionModule } from '@/zsphere-administration/operation-log/action/_modules'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { TagModule } from '@/zsphere-administration/tag/tag.module'
import { ImageModule } from '@/zsphere-resource/image/image.module'

import { FlowModule } from '../../common/flow/flow.module'
import { PubSubModule } from '../../common/pub-sub/pub-sub.module'
import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { VmInstanceDataloader } from '../vm-instance/vm-instance.dataloader'
import { VolumeActionModule } from './action/_module'
import { VolumeQueryService } from './volume-query/volume-query.service'
import { VolumeDataloader } from './volume.dataloader'
import {
  VolumeResolver,
  VolumeSummaryResolver,
  VmAndBareMetal2InstanceSummaryResolver,
  MemorySnapByResourceResolver
} from './volume.resolver'

@Module({
  imports: [
    PubSubModule,
    ZStackApiModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    TagModule,
    PrimaryStorageModule,
    OwnerModule,
    VolumeActionModule,
    OperationLogActionModule,
    ImageModule
  ],
  providers: [
    VolumeResolver,
    CapacityCalculationQueryService,
    VolumeSummaryResolver,
    VolumeQueryService,
    LongJobService,
    CreateDataVolumeAction,
    AttachDataVolumeToVmAction,
    AttachTagToResourcesAction,
    VolumeDataloader,
    VmInstanceDataloader,
    VmAndBareMetal2InstanceSummaryResolver,
    MemorySnapByResourceResolver
  ],
  exports: [VolumeQueryService, VolumeDataloader]
})
export class VolumeModule {}
