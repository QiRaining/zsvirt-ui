import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { L3NetworkModule } from '@/network-resource/l3-network/l3-network.module'
import { VmInstanceModule } from '@/zsphere-resource/vm-instance/vm-instance.module'

import { DataInNetworkTopologyResolver, NetworkTopologyResolver } from './network.resolver'
import { VmCountInL3NetworkDataloader } from './query/query-vm-count'
import { NetworkTopologyQueryService } from './query/query.service'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    VmInstanceModule,
    L3NetworkModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    NetworkTopologyResolver,
    NetworkTopologyQueryService,
    VmCountInL3NetworkDataloader,
    DataInNetworkTopologyResolver
  ]
})
export class NetworkTopologyModule {}
