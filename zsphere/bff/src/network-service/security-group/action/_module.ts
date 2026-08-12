import { Module } from '@nestjs/common'

import { AddVmNicToSecurityGroupService } from './add-nic'
import { AddSecurityGroupRuleService } from './add-rule'
import { ChangeSecurityGroupRuleService } from './change-rule'
import { ChangeSecurityGroupRuleStateService } from './change-rule-state'
import { ChangeSecurityGroupStateService } from './change-state'
import { CreateSecurityGroupService } from './create'
import { DeleteSecurityGroupService } from './delete'
import { DeleteVmNicFromSecurityGroupService } from './delete-nic'
import { DeleteSecurityGroupRuleService } from './delete-rule'
import { UpdateSecurityGroupService } from './update'
import { UpdateSecurityGroupRulePriorityService } from './update-rule-priority'
import { ValidateSecurityGroupRuleService } from './validate-rule'

@Module({
  providers: [
    ChangeSecurityGroupStateService,
    DeleteSecurityGroupService,
    AddSecurityGroupRuleService,
    DeleteSecurityGroupRuleService,
    AddVmNicToSecurityGroupService,
    DeleteVmNicFromSecurityGroupService,
    CreateSecurityGroupService,
    UpdateSecurityGroupService,
    ChangeSecurityGroupRuleStateService,
    ChangeSecurityGroupRuleService,
    UpdateSecurityGroupRulePriorityService,
    ValidateSecurityGroupRuleService
  ],
  exports: []
})
export class SecurityGroupActionModule {}
