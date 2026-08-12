import { Module } from '@nestjs/common'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { HostKernelInterfaceModule } from '@/hardware-resource/host-kernel-interface/host-kernel-interface.module'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { OwnerService } from '@/zsphere-administration/owner/owner.service'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { IpActionModule } from './action/_module'
import { IpRangeResolver, IpStatisticsResolver } from './ip.resolver'
import { IpService } from './ip.service'
import { VmCountDataloader, VRouterCountDataloader } from './link-resource.dataloader'

@Module({
  imports: [ZStackApiModule, IpActionModule, OwnerModule, HostKernelInterfaceModule],
  providers: [
    VmInstanceDataloader,
    IpService,
    IpRangeResolver,
    OwnerService,
    VmCountDataloader,
    IpStatisticsResolver,
    VRouterCountDataloader
  ],
  exports: [IpService]
})
export class IpModule {}
