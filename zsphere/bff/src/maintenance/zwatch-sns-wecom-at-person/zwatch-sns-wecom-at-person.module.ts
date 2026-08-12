import { Module } from '@nestjs/common'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'

import { SNSWeComAtPersonActionModule } from './action/_modules'
import { SNSWeComAtPersonQueryService } from './query/query.service'
import { SNSWeComAtPersonResolver } from './zwatch-sns-wecom-at-person.resolver'

@Module({
  imports: [ZStackApiModule, SNSWeComAtPersonActionModule],
  providers: [SNSWeComAtPersonQueryService, SNSWeComAtPersonResolver],
  exports: [SNSWeComAtPersonQueryService]
})
export class SNSWeComAtPersonModule {}
