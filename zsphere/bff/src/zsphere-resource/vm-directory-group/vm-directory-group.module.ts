import { Module } from '@nestjs/common'

import { ClusterModule } from '@/hardware-resource/cluster/cluster.module'
import { HostModule } from '@/hardware-resource/host/host.module'

import { VmInstanceModule } from '../vm-instance/vm-instance.module'
import { VMDirectoryActionModule } from './action/_module'
import { VMDirectoryQueryService } from './query/vm-directory-query.service'
import { VMDirectorClusterResolver, VMDirectorGroupResolver } from './vm-directory-group.resolver'

@Module({
  imports: [VMDirectoryActionModule, HostModule, VmInstanceModule, ClusterModule],
  providers: [VMDirectoryQueryService, VMDirectorGroupResolver, VMDirectorClusterResolver],
  exports: []
})
export class VmDirectoryGroupModule {}
