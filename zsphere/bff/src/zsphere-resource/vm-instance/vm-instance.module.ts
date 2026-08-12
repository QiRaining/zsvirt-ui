import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { LongJobService } from '@/common/long-job/long-job.service'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import { VmMetricDataLoader } from '@/common/metric-data/vm-metric-data-loader'
import { BackupStorageModule } from '@/hardware-resource/backup-storage/backup-storage.module'
import { ClusterModule } from '@/hardware-resource/cluster/cluster.module'
import { HostModule } from '@/hardware-resource/host/host.module'
import { PciDevicModule } from '@/hardware-resource/pci-device/pci-device.module'
import { PrimaryStorageModule } from '@/hardware-resource/primary-storage/primary-storage.module'
import { TpmModule } from '@/hardware-resource/tpm/tpm.module'
import { ZoneModule } from '@/hardware-resource/zone/zone.module'
import { AuditModule } from '@/maintenance/audit/audit.module'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'
import { ResourceConfigService } from '@/settings/resource-config/resource-config.service'
import { OperationLogActionModule } from '@/zsphere-administration/operation-log/action/_modules'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { TagModule } from '@/zsphere-administration/tag/tag.module'
import { ResourceAttributeModule } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.module'
import { AffinityGroupModule } from '@/zsphere-resource/affinity-group/affinity-group.module'
import { ImageModule } from '@/zsphere-resource/image/image.module'
import { InstanceOfferingModule } from '@/zsphere-resource/instance-offering/instance-offering.module'
import { VmGroupModule } from '@/zsphere-resource/vm-group/vm-group.module'
import {
  VmInstanceByNotRootVolumeDataloader,
  VmInstanceByVolumeDataloader,
  VmInstanceDataloader,
  VmInstanceExportDataloader
} from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { FlowModule } from '../../common/flow/flow.module'
import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { SshKeyPairModule } from '../ssh-key-pair/ssh-key-pair.module'
import { VMActionModule } from './action/_module'
import { StartVmInstanceService } from './action/start-vm-instance'
import { StopVmInstanceService } from './action/stop-vm-instance'
import { GuestToolsStateDataloader } from './vm-instance-query/guestToolsState.dataloader'
import { ResourceConfigCrashDataloader } from './vm-instance-query/resourceConfigCrash.dataloader'
import { SnapshotSchedulerJobDataloader } from './vm-instance-query/snapshostSchedulerJob.dataloader'
import { ToolsDataloader } from './vm-instance-query/tools.dataloader'
import { VmInstanceQueryService } from './vm-instance-query/vm-instance-query.service'
import {
  VmInstanceExportResolver,
  VmInstanceResolver,
  VmInstanceSummaryResolver,
  VmUsageResolver,
  ScreenshotResolver
} from './vm-instance.resolver'
import { VmInstanceService } from './vm-instance.service'

@Module({
  imports: [
    ZoneModule,
    VMActionModule,
    ZStackApiModule,
    FlowModule,
    ClusterModule,
    PrimaryStorageModule,
    SshKeyPairModule,
    OwnerModule,
    ImageModule,
    InstanceOfferingModule,
    TagModule,
    HostModule,
    AffinityGroupModule,
    VmGroupModule,

    L3NetworkModule,
    BackupStorageModule,
    AuditModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession, ZsLongJob]),
    OperationLogActionModule,
    ResourceAttributeModule,
    forwardRef(() => PciDevicModule),
    TpmModule
  ],
  providers: [
    VmInstanceService,
    VmInstanceResolver,
    VmInstanceQueryService,
    QueryVmInstanceAction,
    ResourceConfigService,
    VmInstanceSummaryResolver,
    VmUsageResolver,
    ScreenshotResolver,
    VmInstanceExportResolver,
    LongJobService,
    VmInstanceDataloader,
    MetricDataService,
    StartVmInstanceService,
    StopVmInstanceService,
    VmMetricDataLoader,

    VmInstanceByVolumeDataloader,
    VmInstanceByNotRootVolumeDataloader,
    VmInstanceExportDataloader,
    ResourceConfigCrashDataloader,
    ToolsDataloader,
    GuestToolsStateDataloader,
    SnapshotSchedulerJobDataloader
  ],
  exports: [
    VmInstanceDataloader,
    VmInstanceByVolumeDataloader,
    VmInstanceByNotRootVolumeDataloader,
    VmInstanceQueryService
  ]
})
export class VmInstanceModule {}
