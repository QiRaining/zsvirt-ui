import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, Parent, ResolveField } from '@nestjs/graphql'

import { ZsvRoleQueryService } from './query/zsv-role-query.service'
import { ZsvRole, ZsvRoleList, QueryZsvRoleArgs, ZsvRoleUIPrivilege } from './zsv-role.model'

@Resolver(() => ZsvRole)
export class ZsvRoleResolver {
  @Inject() zsvRoleQueryService: ZsvRoleQueryService

  @Query(() => ZsvRoleList)
  zsvRoleList(@Args() queryArgs: QueryZsvRoleArgs) {
    return this.zsvRoleQueryService.get(queryArgs)
  }

  @ResolveField(() => String)
  async uiPrivilege(@Parent() role: ZsvRole) {
    return this.zsvRoleQueryService.getUiPrivilege(role)
  }

  @ResolveField()
  async policies(@Parent() role: ZsvRole) {
    return this.zsvRoleQueryService.getPolicies(role)
  }

  @ResolveField()
  async userCount(@Parent() role: ZsvRole) {
    return await this.zsvRoleQueryService.getUserCount(role.uuid)
  }

  @ResolveField()
  async userGroupCount(@Parent() role: ZsvRole) {
    return await this.zsvRoleQueryService.getUserGroupCount(role.uuid)
  }

  @Query(() => ZsvRoleUIPrivilege)
  async zsvUiPrivileges() {
    return await this.zsvRoleQueryService.getUiPrivileges()
  }
}
