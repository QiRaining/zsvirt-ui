import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import { ClusterDataloader } from '@/hardware-resource/cluster/cluster.dataloader'
import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { HostService } from '@/hardware-resource/host/host.service'
import { HostQueryService } from '@/hardware-resource/host/query/host-query.service'
import { PrimaryStorageQueryService } from '@/hardware-resource/primary-storage/primary-storage-query/primary-storage-query.service'
import { SensorModule } from '@/hardware-resource/sensor/sensor.module'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { QueryL3NetworkService } from '@/network-resource/l3-network/query/query.service'
import { VxlanPoolDataloader } from '@/network-resource/vxlan-pool/vxlan-pool.dataloader'
import { ResourceConfigService } from '@/settings/resource-config/resource-config.service'
import { TagService } from '@/zsphere-administration/tag/tag.service'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { MdevDeviceQueryService } from '../mdev-device/mdev-device-query/mdev-device-query.service'
import { HostInterfaceService } from '../pci-device/pci-device-query/host-interface.service'
import { PciDeviceQueryService } from '../pci-device/pci-device-query/pci-device-query.service'
import { StorageAdapterModule } from '../storage-adapter/storage-adapter.module'
import { VGpuDeviceService } from '../vgpu-device/vgpu-device.service'
import { ZoneModule } from '../zone/zone.module'
import { ClusterActionModule } from './action/_module'
import {
  ClusterResolver,
  DRSAdviceResolve,
  VmMigrationActivityResolver,
  DRSResolve,
  DRSVmMigrationActivityResolve
} from './cluster.resolver'
import { ClusterService } from './cluster.service'
import { HostDataloader2 } from './query/host.dataloader'
import { ResourceConfigNetworkHpDataloader } from './query/resource-config.dataloader'

@Module({
  imports: [
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    ClusterActionModule,
    SensorModule,
    StorageAdapterModule,
    ZoneModule
  ],
  providers: [
    ClusterService,
    ClusterResolver,
    VmMigrationActivityResolver,
    DRSAdviceResolve,
    DRSResolve,
    DRSVmMigrationActivityResolve,

    TagService,
    HostService,
    HostQueryService,
    PrimaryStorageQueryService,
    ClusterDataloader,
    HostDataloader,
    VmInstanceDataloader,
    MetricDataService,
    VxlanPoolDataloader,
    HostDataloader2,
    VGpuDeviceService,
    PciDeviceQueryService,
    HostInterfaceService,
    MdevDeviceQueryService,
    ResourceConfigNetworkHpDataloader,
    ResourceConfigService,
    QueryL3NetworkService,
    CapacityCalculationQueryService
  ],
  exports: [
    ClusterDataloader,
    ClusterService,

    VGpuDeviceService,
    PciDeviceQueryService,
    HostInterfaceService,
    MdevDeviceQueryService,
    PrimaryStorageQueryService,
    ResourceConfigService,
    CapacityCalculationQueryService
  ]
})
export class ClusterModule {}
