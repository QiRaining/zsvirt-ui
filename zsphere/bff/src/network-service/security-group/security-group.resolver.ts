import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { CommonOwner } from '@/zsphere-administration/owner/owner.model'

import { SecurityGroupDataloader } from './security-group.dataloader'
import {
  SecurityGroupList,
  SecurityGroup,
  SecurityGroupRule,
  SecurityGroupRuleList,
  QuerySecurityGroupArgs
} from './security-group.model'
import { SecurityGroupService } from './security-group.service'

@Resolver(() => SecurityGroup)
export class SecurityGroupResolver {
  @Inject() securityGroupService: SecurityGroupService
  @Inject() ownerDataLoader: OwnerDataLoader

  @Query(() => SecurityGroupList)
  async securityGroupList(@Args() queryArgs: QuerySecurityGroupArgs) {
    return this.securityGroupService.query(queryArgs)
  }

  @Query(() => SecurityGroup)
  async securityGroup(@Args('uuid') uuid: string) {
    const queryArgs: QuerySecurityGroupArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }
    const result = await this.securityGroupService.query(queryArgs)
    return result.list[0]
  }

  @ResolveField(() => CommonOwner)
  async owner(@Parent() securityGroup: SecurityGroup) {
    return await this.ownerDataLoader.query(securityGroup.uuid)
  }

  @ResolveField(() => Boolean)
  async projectUuid(@Parent() securityGroup: SecurityGroup) {
    return this.securityGroupService.projectUuid(securityGroup.uuid)
  }

  @ResolveField(() => Number)
  vmNicCount(@Parent() securityGroup: SecurityGroup) {
    return this.securityGroupService.vmNicCount(securityGroup.uuid)
  }
}

@Resolver(() => SecurityGroupRule)
export class SecurityGroupRuleResolver {
  @Inject()
  service: SecurityGroupService
  @Inject() dataloader: SecurityGroupDataloader

  @Query(() => SecurityGroupRuleList)
  async securityGroupRuleList(@Args() queryArgs: IQueryAction) {
    return this.service.queryRule(queryArgs)
  }

  @ResolveField()
  async remoteSecurityGroup(@Parent() securityGroupRule: SecurityGroupRule) {
    return await this.dataloader.query(
      securityGroupRule.uuid,
      securityGroupRule?.remoteSecurityGroupUuid
    )
  }
}
