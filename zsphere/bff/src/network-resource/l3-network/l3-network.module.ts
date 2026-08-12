import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { FlowModule } from '@/common/flow/flow.module'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import { HostKernelInterfaceModule } from '@/hardware-resource/host-kernel-interface/host-kernel-interface.module'
import { L2NetworkDataloader } from '@/hardware-resource/l2-network/l2-network.dataloader'
import { L2NetworkService } from '@/hardware-resource/l2-network/l2.network.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { OwnerService } from '@/zsphere-administration/owner/owner.service'
import { TagService } from '@/zsphere-administration/tag/tag.service'
import { ResourceAttributeModule } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.module'

import { L3NetworkActionModule } from './action/_module'
import { IpModule } from './ip/ip.module'
import { L3NetworkDataloader } from './l3-network.dataloader'
import {
  L3NetworkResolver,
  NetworkServicesResolver,
  VlanIdValidateResolver
} from './l3-network.resolver'
import { L3NetworkService } from './l3-network.service'
import { HypervisorDataloader } from './query/hypervisor.dataloader'
import { ResourceConfigIpAllocateStrategyDataloader } from './query/ip-allocation.dataloader'
import { NetworkServiceDataloader } from './query/network-service.dataloader'
import { QueryL3NetworkService } from './query/query.service'

@Module({
  imports: [
    ZStackApiModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    IpModule,
    L3NetworkActionModule,
    ResourceAttributeModule,
    OwnerModule,
    HostKernelInterfaceModule
  ],
  providers: [
    L3NetworkResolver,
    QueryL3NetworkService,
    OwnerService,
    L2NetworkService,
    L3NetworkService,
    TagService,
    MetricDataService,
    L3NetworkDataloader,
    HypervisorDataloader,
    NetworkServicesResolver,
    VlanIdValidateResolver,
    L2NetworkDataloader,
    NetworkServiceDataloader,
    ResourceConfigIpAllocateStrategyDataloader
  ],
  exports: [L3NetworkDataloader]
})
export class L3NetworkModule {}
