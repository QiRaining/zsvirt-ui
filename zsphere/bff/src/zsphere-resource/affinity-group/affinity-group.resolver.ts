import { Inject } from '@nestjs/common'
import { Query, Resolver, Args, ResolveField, Parent } from '@nestjs/graphql'

import {
  AffinityGroup as IAffinityGroup,
  AffinityGroupList as IAffinityGroupList,
  QueryAffinityGroupArgs
} from './affinity-group.model'
import { AffinityGroupService } from './affinity-group.service'

@Resolver(() => IAffinityGroup)
export class AffinityGroupResolver {
  @Inject() affinityGroupService: AffinityGroupService

  // query list
  @Query(() => IAffinityGroupList)
  affinityGroupList(@Args() queryArgs: QueryAffinityGroupArgs) {
    return this.affinityGroupService.queryList(queryArgs)
  }

  @ResolveField()
  async owner(@Parent() afffinityGroup: IAffinityGroup) {
    return this.affinityGroupService.getOwner(afffinityGroup.uuid)
  }
}
