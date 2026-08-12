import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ClusterModule } from '@/hardware-resource/cluster/cluster.module'
import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { L2NetworkModule } from '@/hardware-resource/l2-network/l2.network.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { VxlanPoolDataloader } from './vxlan-pool.dataloader'
import { VxlanPoolResolver, VxlanPoolAttachedVtepResolver } from './vxlan-pool.resolver'
import { VxlanPoolService } from './vxlan-pool.service'

@Module({
  imports: [
    OwnerModule,
    L2NetworkModule,
    ClusterModule,
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    VxlanPoolResolver,
    VxlanPoolAttachedVtepResolver,
    VxlanPoolService,
    HostDataloader,
    VxlanPoolDataloader
  ],
  exports: [VxlanPoolDataloader]
})
export class VxlanPoolModule {}
