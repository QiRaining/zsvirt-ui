import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ClusterModule } from '@/hardware-resource/cluster/cluster.module'
import { ZoneModule } from '@/hardware-resource/zone/zone.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { TagModule } from '@/zsphere-administration/tag/tag.module'
import { ResourceAttributeModule } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.module'
import { BaremetalChassisModule } from '@/zsphere-resource/baremetal/baremetal-chassis/baremetal-chassis.module'
import { BaremetalInstanceActionModule } from '@/zsphere-resource/baremetal/baremetal-instance/action/_module'
import { BaremetalInstanceDataloader } from '@/zsphere-resource/baremetal/baremetal-instance/baremetal-instance.dataloader'
import {
  BaremetalInstanceResolver,
  BaremetalNicResolver,
  BaremetalDiskResolver
} from '@/zsphere-resource/baremetal/baremetal-instance/baremetal-instance.resolver'
import { BaremetalInstanceQueryService } from '@/zsphere-resource/baremetal/baremetal-instance/query/baremetal-instance-query.service'
import { BaremetalPxeServerModule } from '@/zsphere-resource/baremetal/baremetal-pxe-server/baremetal-pxe-server.module'
import { ImageModule } from '@/zsphere-resource/image/image.module'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    BaremetalInstanceActionModule,
    ClusterModule,
    BaremetalPxeServerModule,
    TagModule,
    ImageModule,
    ZoneModule,
    L3NetworkModule,
    BaremetalChassisModule,
    ResourceAttributeModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    BaremetalInstanceResolver,
    BaremetalNicResolver,
    BaremetalDiskResolver,
    BaremetalInstanceQueryService,
    BaremetalInstanceDataloader,
    OwnerDataLoader
  ],
  exports: [BaremetalInstanceDataloader]
})
export class BaremetalInstanceModule {}
