import { Module } from '@nestjs/common'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'

import { SNSFeiShuAtPersonActionModule } from './action/_modules'
import { SNSFeiShuAtPersonQueryService } from './query/query.service'
import { SNSFeiShuAtPersonResolver } from './zwatch-sns-feishu-at-person.resolver'

@Module({
  imports: [ZStackApiModule, SNSFeiShuAtPersonActionModule],
  providers: [SNSFeiShuAtPersonQueryService, SNSFeiShuAtPersonResolver],
  exports: [SNSFeiShuAtPersonQueryService]
})
export class SNSFeiShuAtPersonModule {}
