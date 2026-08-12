import { Module } from '@nestjs/common'

import { BaremetalPxeServerModule } from '../baremetal-pxe-server/baremetal-pxe-server.module'
import { CreateClusterService } from './action/create'
import { BaremetalClusterResolver } from './baremetal-cluster.resolver'

@Module({
  imports: [BaremetalPxeServerModule],
  providers: [CreateClusterService, BaremetalClusterResolver],
  exports: [CreateClusterService]
})
export class BaremetalClusterModule {}
