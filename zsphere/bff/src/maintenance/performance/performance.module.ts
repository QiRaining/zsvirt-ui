import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerModule } from '@/zsphere-administration/owner/owner.module'

import {
  BackupStoragePerformanceResolver,
  HostPerformanceResolver,
  L3NetworkPerformanceResolver,
  VmInstancePerformanceResolver
} from './performance.resolver'
import { PerformanceService } from './performance.service'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    OwnerModule
  ],
  providers: [
    VmInstancePerformanceResolver,
    HostPerformanceResolver,
    BackupStoragePerformanceResolver,

    L3NetworkPerformanceResolver,
    PerformanceService
  ]
})
export class PerformanceModule {}
