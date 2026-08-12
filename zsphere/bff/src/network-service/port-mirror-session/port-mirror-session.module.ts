import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { QueryL3NetworkService } from '@/network-resource/l3-network/query/query.service'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { QueryVmNicService } from '@/zsphere-resource/vm-nic/query/query.service'
import { VmNicModule } from '@/zsphere-resource/vm-nic/vm-nic.module'
import { PortMirrorSessionResolver } from './port-mirror-session.resolver'
import { PortMirrorSessionService } from './port-mirror-session.service'

@Module({
  imports: [VmNicModule, SequelizeModule.forFeature([ZsEvent, ZsSession]), OwnerModule],
  providers: [
    PortMirrorSessionResolver,
    PortMirrorSessionService,
    QueryVmNicService,
    QueryL3NetworkService
  ]
})
export class PortMirrorSessionModule {}
