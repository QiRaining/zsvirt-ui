import { Module, Scope } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FlowModule } from '@/common/flow/flow.module'
import { PubSubModule } from '@/common/pub-sub/pub-sub.module'
import { SystemTagDataloader } from '@/common/system-tag/system-tag.dataloader'
import { ZWatchAlarmQueryService } from '@/maintenance/zwatch-alarm/zwatch-alarm-query/zwatch-alarm-query.service'
import { ZWatchAlarmResolver } from '@/maintenance/zwatch-alarm/zwatch.alarm.resolver'
import { ZWatchAlarmService } from '@/maintenance/zwatch-alarm/zwatch.alarm.service'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { TagForAlarmDataloader } from '@/zsphere-administration/tag/tag.dataloader'

import { ThirdpartyPlatformDataloader } from '../zwatch-thirdparty-platform/zwatch-thirdparty-platform.dataloader'
import { ZWatchAlarmActionModule } from './action/_module'

@Module({
  imports: [
    PubSubModule,
    FlowModule,
    ZWatchAlarmActionModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [
    ZWatchAlarmQueryService,
    TagForAlarmDataloader,
    ThirdpartyPlatformDataloader,
    OwnerDataLoader,
    SystemTagDataloader,
    {
      provide: 'resourceTypeSystemTagDataloader',
      useClass: SystemTagDataloader,
      scope: Scope.TRANSIENT
    },
    ZWatchAlarmService,
    ZWatchAlarmResolver
  ]
})
export class ZWatchAlarmModule {}
