import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import { SystemTagModule } from '@/common/system-tag/system-tag.module'
import { CapacityCalculationModule } from '@/maintenance/capacity-calculation/capacity-calculation.module'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { TagsDataloader } from '@/zsphere-administration/tag/tag.dataloader'
import { ResourceAttributeModule } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.module'

import { TagService } from '../../zsphere-administration/tag/tag.service'
import { MdevDeviceQueryService } from '../mdev-device/mdev-device-query/mdev-device-query.service'
import { HostInterfaceService } from '../pci-device/pci-device-query/host-interface.service'
import { PciDeviceQueryService } from '../pci-device/pci-device-query/pci-device-query.service'
import { SensorModule } from '../sensor/sensor.module'
import { StorageAdapterModule } from '../storage-adapter/storage-adapter.module'
import { VGpuDeviceService } from '../vgpu-device/vgpu-device.service'
import { HostActionModule } from './action/_module'
import { HostCreateModule } from './create/_module'
import { HostDataloader } from './host.dataloader'
import {
  HostHardwareInfoResolver,
  HostResolver,
  HostSummaryResolver,
  HostUsageResolver,
  HostWebTerminalUrlResolver
} from './host.resolver'
import { HostService } from './host.service'
import { HostQueryService } from './query/host-query.service'
import { HardwareSummaryService } from './query/summary.service'

@Module({
  imports: [
    ZStackApiModule,
    HostActionModule,
    HostCreateModule,
    SystemTagModule,
    CapacityCalculationModule,
    SensorModule,
    StorageAdapterModule,
    ResourceAttributeModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    HostService,
    HostQueryService,
    TagService,
    HostResolver,
    HostSummaryResolver,
    HardwareSummaryService,
    HostHardwareInfoResolver,
    HostDataloader,
    TagsDataloader,
    MetricDataService,
    VGpuDeviceService,
    PciDeviceQueryService,
    HostInterfaceService,
    MdevDeviceQueryService,
    HostUsageResolver,
    HostWebTerminalUrlResolver,
    CapacityCalculationQueryService
  ],
  exports: [HostDataloader, HostService]
})
export class HostModule {}
