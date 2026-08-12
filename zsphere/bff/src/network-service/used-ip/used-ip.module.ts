import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { VmNicModule } from '@/zsphere-resource/vm-nic/vm-nic.module'

import { UsedIpResolver } from './used-ip.resolver'
import { UsedIpService } from './used-ip.service'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    VmNicModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [UsedIpResolver, UsedIpService]
})
export class UsedIpModule {}
