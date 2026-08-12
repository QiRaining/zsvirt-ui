import { Inject } from '@nestjs/common'
import { Query, Resolver, Args, ResolveField, Parent, Mutation } from '@nestjs/graphql'

import { ZoneDataloader } from '@/hardware-resource/zone/zone.dataloader'
import { VmGroupBase } from '@/zsphere-resource/vm-group/vm-group-base.model'
import { VmGroupService } from '@/zsphere-resource/vm-group/vm-group.service'

import {
  VmSchedulingRule as IVmSchedulingRule,
  VmSchedulingRuleList as IVmSchedulingRuleList,
  QueryVmSchedulingRuleArgs,
  ResourceUpgradeConfig,
  ValidateVmSchedulingRuleResult,
  ValidateVmSchedulingRuleParam
} from './vm-scheduling-rule.model'
import { VmSchedulingRuleService } from './vm-scheduling-rule.service'

@Resolver(() => IVmSchedulingRule)
export class VmSchedulingRuleResolver {
  @Inject() vmSchedulingRuleService: VmSchedulingRuleService
  @Inject() zoneDataloader: ZoneDataloader
  @Inject() vmGroupService: VmGroupService

  // query list
  @Query(() => IVmSchedulingRuleList)
  vmSchedulingRuleList(@Args() queryArgs: QueryVmSchedulingRuleArgs) {
    return this.vmSchedulingRuleService.queryList(queryArgs)
  }

  @ResolveField()
  async zone(@Parent() vmSchedulingRule: IVmSchedulingRule) {
    return this.zoneDataloader.query(vmSchedulingRule?.uuid, vmSchedulingRule?.zoneUuid)
  }

  @ResolveField('vmGroup', () => VmGroupBase, { nullable: true })
  async vmGroup(@Parent() vmSchedulingRule: IVmSchedulingRule): Promise<VmGroupBase | null> {
    if (!vmSchedulingRule.vmGroup) {
      return null
    }
    const [vmCount, vmSchedulingRuleCount] = await Promise.all([
      this.vmGroupService.getVmCount(vmSchedulingRule.vmGroup),
      this.vmGroupService.getVmSchedulingRuleCount(vmSchedulingRule.vmGroup)
    ])

    return {
      ...vmSchedulingRule.vmGroup,
      vmCount,
      vmSchedulingRuleCount
    }
  }

  @Query(() => ResourceUpgradeConfig)
  async queryResourceUpgradeConfig(): Promise<ResourceUpgradeConfig> {
    return await this.vmSchedulingRuleService.getUpgradeConfig()
  }

  @Mutation(() => ValidateVmSchedulingRuleResult)
  async validateVmSchedulingRule(@Args('input') input: ValidateVmSchedulingRuleParam) {
    return this.vmSchedulingRuleService.validateVmSchedulingRule(input)
  }
}
