import { Module } from '@nestjs/common'

import { AccessControlRuleResolver } from './access-control-rule.resolver'
import { AccessControlRuleActionModule } from './action/_modules'
import { AccessControlRuleQueryService } from './query/access-control-rule.query.service'

@Module({
  imports: [AccessControlRuleActionModule],
  providers: [AccessControlRuleResolver, AccessControlRuleQueryService],
  exports: [AccessControlRuleQueryService]
})
export class AccessControlRuleModule {}
