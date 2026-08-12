import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import { TagActionModule } from './action/_module'
import { TagDataloader, TagForAlarmDataloader, TagsDataloader } from './tag.dataloader'
import { TagResolver } from './tag.resolver'
import { TagService } from './tag.service'
@Module({
  imports: [TagActionModule, ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [
    TagResolver,
    TagService,
    TagDataloader,
    TagsDataloader,
    OwnerDataLoader,
    TagForAlarmDataloader
  ],
  exports: [TagDataloader, TagsDataloader]
})
export class TagModule {}
