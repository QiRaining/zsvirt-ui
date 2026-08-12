import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { PciDeviceActionModule } from '@/hardware-resource/pci-device/action/_module'
import { PciDeviceDataloader } from '@/hardware-resource/pci-device/pci-device.dataloader'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'
import { VmInstanceModule } from '@/zsphere-resource/vm-instance/vm-instance.module'

import { FlowModule } from '../../common/flow/flow.module'
import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { BondModule } from '../bond/bond.module'
import { HostModule } from '../host/host.module'
import { PhysicalNetworkModule } from '../physical-network/physical-network.module'
import { HostNetworkInterfaceDataloader } from './hostnetworkinferface.data.loader'
import { HostInterfaceService } from './pci-device-query/host-interface.service'
import { PciDeviceQueryService } from './pci-device-query/pci-device-query.service'
import { PhysicalMetricDataLoader } from './pci-device-query/physical-metric.data.loader'
import { PciDeviceForPhysicalNicDataloader } from './pci-device-query/physical-pci.data.loader'
import { PciDeviceResolver, PhysicalNicResolver } from './pci-device.resolver'
import { PciDevicService } from './pci-device.service'

@Module({
  imports: [
    PciDeviceActionModule,
    ZStackApiModule,
    FlowModule,
    OwnerModule,
    HostModule,
    BondModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    PhysicalNetworkModule,
    forwardRef(() => VmInstanceModule)
  ],
  providers: [
    VmInstanceDataloader,
    PciDeviceResolver,
    PciDevicService,
    PciDeviceQueryService,
    HostInterfaceService,
    PciDeviceDataloader,
    PhysicalNicResolver,
    PciDeviceForPhysicalNicDataloader,
    PhysicalMetricDataLoader,
    HostNetworkInterfaceDataloader
  ],
  exports: [
    PciDeviceDataloader,
    PciDevicService,
    PciDeviceQueryService,
    HostNetworkInterfaceDataloader
  ]
})
export class PciDevicModule {}
