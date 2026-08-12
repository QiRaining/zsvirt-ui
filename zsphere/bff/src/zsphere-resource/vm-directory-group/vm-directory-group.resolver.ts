import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { VMDirectoryQueryService } from './query/vm-directory-query.service'
import {
  QueryDirArgs,
  VMClusterDirectory,
  VMClusterDirectoryList,
  VMGroupDirectory,
  VMGroupDirectoryList
} from './vm-directory-group.model'

@Resolver(() => VMGroupDirectory)
export class VMDirectorGroupResolver {
  @Inject() vmDirectoryQueryService: VMDirectoryQueryService

  @Query(() => VMGroupDirectoryList)
  async vmDirectoryGroupList(@Args() args: QueryDirArgs) {
    return await this.vmDirectoryQueryService.getGroupDir(args)
  }

  @Query(() => VMGroupDirectoryList)
  async vmSubDirGroupList(@Args() args: QueryDirArgs) {
    return await this.vmDirectoryQueryService.getSubGroupDir(args)
  }

  @Query(() => VMGroupDirectoryList)
  async vmDirectoryGroupByUuid(@Args() args: QueryDirArgs) {
    return await this.vmDirectoryQueryService.getGroupDirByUuid(args)
  }

  @Query(() => VMGroupDirectoryList)
  async getGroupDirTreeByUuid(@Args() args: QueryDirArgs) {
    return await this.vmDirectoryQueryService.getGroupDirTreeByUuid(args)
  }
  @Query(() => VMGroupDirectoryList)
  async vmGroupCount(@Args() args: QueryDirArgs) {
    return await this.vmDirectoryQueryService.getGroupDirCount(args)
  }

  @ResolveField()
  async vmCount(@Parent() group: VMGroupDirectory) {
    if (group.key === '-1' || group.key === '-2') {
      return group.count || 0
    }
    return await this.vmDirectoryQueryService.getVMCount(group)
  }
}
@Resolver(() => VMClusterDirectory)
export class VMDirectorClusterResolver {
  @Inject() vmDirectoryQueryService: VMDirectoryQueryService

  @Query(() => VMClusterDirectoryList)
  async vmDirectoryClusterList(@Args() args: QueryDirArgs) {
    const resp = await this.vmDirectoryQueryService.getClusterDir(args)
    return resp
  }
}
