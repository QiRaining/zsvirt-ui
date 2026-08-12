import { Module } from '@nestjs/common'

import { AddAccessControlRuleService } from './add'
import { DeleteAccessControlRuleService } from './delete'
import { UpdateAccessControlRuleService } from './update'

@Module({
  providers: [
    AddAccessControlRuleService,
    DeleteAccessControlRuleService,
    UpdateAccessControlRuleService
  ],
  exports: []
})
export class AccessControlRuleActionModule {}
