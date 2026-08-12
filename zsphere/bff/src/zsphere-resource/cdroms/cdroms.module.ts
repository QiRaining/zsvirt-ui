import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { CdRomActionModule } from './action/_modules'
import { CdRomsResolver } from './cdroms.resolver'
import { CdRomsService } from './cdroms.service'

@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession]), CdRomActionModule],
  providers: [CdRomsResolver, CdRomsService],
  exports: [CdRomsService]
})
export class CdRomsModule {}
