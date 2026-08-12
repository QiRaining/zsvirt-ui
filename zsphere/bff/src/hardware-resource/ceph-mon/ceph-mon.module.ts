import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { QueryBase } from '@/api/zstack/base/query-base'
import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { CephMonResolver } from '@/hardware-resource/ceph-mon/ceph-mon.resolver'
import { CephMonService } from '@/hardware-resource/ceph-mon/ceph-mon.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { CephMonActionModule } from './action/_module'

@Module({
  imports: [
    CephMonActionModule,
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [CephMonService, CephMonResolver, QueryBase]
})
export class CephMonModule {}
