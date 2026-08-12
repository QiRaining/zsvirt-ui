import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { SystemTag } from '@/zsphere-administration/tag/tag.model'

import { QueryRemoteBackupStorageService } from './query/remote-backup-storage-query'
import {
  QueryRemoteBackupStorageArgs,
  QueryRemoteBackupStorageSystemTagsArgs,
  RemoteBackupStorage,
  RemoteBackupStorageQueryResp,
  RemoteBackupStorageSystemTagsQueryResp
} from './remote-backup-storage.model'

@Resolver(() => RemoteBackupStorage)
export class RemoteBackupStorageResolver {
  @Inject()
  queryRemoteBackupStorageService: QueryRemoteBackupStorageService

  @Query(() => RemoteBackupStorageQueryResp)
  async remoteBackupStorageList(@Args() queryArgs: QueryRemoteBackupStorageArgs) {
    return await this.queryRemoteBackupStorageService.query(queryArgs)
  }

  @ResolveField('tag')
  async tag(@Parent() remoteBackupStorage: RemoteBackupStorage) {
    return await this.queryRemoteBackupStorageService.querySystemTags({
      conditions: [{ key: 'tag', op: Op.in, values: ['aliyun', 'remotebackup'] }]
    })
  }
}

@Resolver(() => SystemTag)
export class RemoteBackupStorageSystemTagsResolver {
  @Inject()
  queryRemoteBackupStorageService: QueryRemoteBackupStorageService

  @Query(() => RemoteBackupStorageSystemTagsQueryResp)
  async remoteBackupStorageSystemTagsList(
    @Args() queryArgs: QueryRemoteBackupStorageSystemTagsArgs
  ) {
    return await this.queryRemoteBackupStorageService.querySystemTags(queryArgs)
  }
}
