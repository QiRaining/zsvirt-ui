import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { MetricDataService } from '@/common/metric-data/metric-data.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { QueryL3NetworkService } from '@/network-resource/l3-network/query/query.service'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { VmNicActionModule } from './action/_module'
import { QueryVmNicService } from './query/query.service'
import { VmNicDataloader } from './vm-nic.dataloader'
import { UsedIpResolver, VmNicResolver } from './vm-nic.resolver'
import { VmNicService } from './vm-nic.service'

@Module({
  imports: [SequelizeModule.forFeature([ZsEvent, ZsSession]), OwnerModule, VmNicActionModule],
  providers: [
    VmNicResolver,
    VmNicService,
    QueryL3NetworkService,
    MetricDataService,
    VmInstanceDataloader,
    L3NetworkDataloader,
    QueryVmNicService,
    VmNicDataloader,
    UsedIpResolver
  ],
  exports: [VmNicDataloader, QueryVmNicService]
})
export class VmNicModule {}
