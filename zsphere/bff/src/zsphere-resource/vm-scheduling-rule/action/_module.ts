import { Module } from '@nestjs/common'

import { ChangeVmSchedulingRuleStateService } from './change-state'
import { CreateVmSchedulingRuleService } from './create'
import { DeleteVmSchedulingRuleService } from './delete'
import { UpdateVmSchedulingRuleService } from './update'

@Module({
  providers: [
    CreateVmSchedulingRuleService,
    DeleteVmSchedulingRuleService,
    UpdateVmSchedulingRuleService,
    ChangeVmSchedulingRuleStateService
  ],
  exports: []
})
export class VmSchedulingRuleActionModule {}
