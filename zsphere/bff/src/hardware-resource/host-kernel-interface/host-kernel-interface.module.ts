import { Module, forwardRef } from '@nestjs/common'

import { SystemTagModule } from '@/common/system-tag/system-tag.module'
import { HostModule } from '@/hardware-resource/host/host.module'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'

import { HostKernelInterfaceActionModule } from './action/_module'
import { HostKernelInterfaceResolver } from './host-kernel-interface.resolver'
import { HostKernelInterfaceQueryService } from './query/host-kernel-interface-query.service'
import { HostKernelInterfaceDataloader } from './query/host-kernel-interface.dataloader'

@Module({
  imports: [
    HostKernelInterfaceActionModule,
    SystemTagModule,
    forwardRef(() => L3NetworkModule),
    forwardRef(() => HostModule)
  ],
  providers: [
    HostKernelInterfaceResolver,
    HostKernelInterfaceQueryService,
    HostKernelInterfaceDataloader
  ],
  exports: [
    HostKernelInterfaceResolver,
    HostKernelInterfaceQueryService,
    HostKernelInterfaceDataloader
  ]
})
export class HostKernelInterfaceModule {}
