import { Module } from '@nestjs/common'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'

import { SNSDingTalkAtPersonActionModule } from './action/_modules'
import { SNSDingTalkAtPersonQueryService } from './query/query.service'
import { SNSDingTalkAtPersonResolver } from './zwatch-sns-dingtalk-at-person.resolver'

@Module({
  imports: [ZStackApiModule, SNSDingTalkAtPersonActionModule],
  providers: [SNSDingTalkAtPersonQueryService, SNSDingTalkAtPersonResolver],
  exports: [SNSDingTalkAtPersonQueryService]
})
export class SNSDingTalkAtPersonModule {}
