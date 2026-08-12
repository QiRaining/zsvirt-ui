import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, Parent, ResolveField } from '@nestjs/graphql'

import { UserGroupQueryService } from './query/user-group-query.service'
import { UserGroup, UserGroupList, QueryUserGroupArgs } from './user-group.model'

@Resolver(() => UserGroup)
export class UserGroupResolver {
  @Inject() userGroupQueryService: UserGroupQueryService

  @Query(() => UserGroupList)
  userGroupList(@Args() queryArgs: QueryUserGroupArgs) {
    return this.userGroupQueryService.get(queryArgs)
  }

  @ResolveField()
  groupUserCount(@Parent() userGroup: UserGroup) {
    return this.userGroupQueryService.getGroupUserCount(userGroup.uuid)
  }

  @ResolveField()
  role(@Parent() userGroup: UserGroup) {
    return this.userGroupQueryService.getRole(userGroup.uuid)
  }
}
