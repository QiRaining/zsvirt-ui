import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { DataProtectionService } from '@/zstack-cloud-code/crypto-compliance/data-protection/data-protection.service'

import {
  AccessControlRule,
  AccessControlRuleList,
  QueryAccessControlRuleArgs
} from './access-control-rule.model'
import { AccessControlRuleQueryService } from './query/access-control-rule.query.service'

@Resolver(() => AccessControlRule)
export class AccessControlRuleResolver {
  @Inject() accessControlRuleQueryService: AccessControlRuleQueryService
  @Inject() dataProtectionService: DataProtectionService

  @Query(() => AccessControlRuleList)
  accessControlRuleList(@Args() queryArgs: QueryAccessControlRuleArgs) {
    return this.accessControlRuleQueryService.get(queryArgs)
  }

  @Query(() => AccessControlRule)
  accessControlRule(@Args('uuid') uuid: string) {
    return this.accessControlRuleQueryService.accessControlRule(uuid)
  }

  @ResolveField(() => Boolean)
  async isValid(@Parent() accessControlRule: AccessControlRule) {
    return await this.dataProtectionService.checkDataIntegrity(
      accessControlRule.uuid,
      'AccessControlRuleVO'
    )
  }
}
