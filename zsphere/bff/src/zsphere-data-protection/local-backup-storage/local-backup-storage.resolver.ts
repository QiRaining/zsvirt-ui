import { Inject } from '@nestjs/common'
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import {
  LocalBackupStorage,
  LocalBackupStorageOfBackupJobSummary,
  LocalBackupStorageOfCdpTaskSummary,
  LocalBackupStorageQueryResp,
  LocalBackupStorageSystemTagsQueryResp,
  QueryLocalBackupStorageArgs,
  QueryLocalBackupSystemTagsArgs,
  ScanLocalBackupStorage
} from './local-backup-storage.model'
import { QueryLocalBackupStorageService } from './query/local-backup-storage-query'

@Resolver(() => LocalBackupStorage)
export class LocalBackupStorageResolver {
  @Inject()
  queryLocalBackupStorageService: QueryLocalBackupStorageService

  @Query(() => LocalBackupStorageQueryResp)
  async localBackupStorageList(@Args() queryArgs: QueryLocalBackupStorageArgs) {
    return await this.queryLocalBackupStorageService.query(queryArgs)
  }

  @ResolveField(() => Number, { description: '本地备份服务器关联的CDP 任务' })
  async cdpTaskCount(@Parent() bocalBackupStorage: LocalBackupStorage) {
    return await this.queryLocalBackupStorageService.getCdpTaskCount(bocalBackupStorage.uuid)
  }

  @ResolveField(() => Number, { description: '本地备份服务器关联的备份任务' })
  async backupJobCount(@Parent() bocalBackupStorage: LocalBackupStorage) {
    return await this.queryLocalBackupStorageService.getBackupJobCount(bocalBackupStorage.uuid)
  }

  @Query(() => LocalBackupStorageSystemTagsQueryResp)
  async localBackupStorageSystemTagsList(@Args() queryArgs: QueryLocalBackupSystemTagsArgs) {
    return await this.queryLocalBackupStorageService.querySystemTags(queryArgs)
  }

  @Query(() => ScanLocalBackupStorage)
  async scanlocalBackupStorage(
    @Args({ name: 'backupStorageUuid' }) backupStorageUuid: string,
    @Args({ name: 'zoneUuid' }) zoneUuid: string
  ) {
    return await this.queryLocalBackupStorageService.scanlocalBackupStorage(
      backupStorageUuid,
      zoneUuid
    )
  }
}

// CdpTask 和 BS 是一一对应的，所以不用处理
// @Resolver(() => LocalBackupStorageOfCdpTaskSummary)
// export class LocalBackupStorageOfCdpTaskSummaryResolver {
//   @Inject() queryLocalBackupStorageService: QueryLocalBackupStorageService

//   @Query(() => LocalBackupStorageOfCdpTaskSummary)
//   async getLocalBackupStorageOfCdpTaskSummary(@Args({ name: 'backupStorageUuids' }) backupStorageUuids: string[]) {
//     return backupStorageUuids || []
//   }

//   @ResolveField(() => Int)
//   async total(@Parent() backupStorageUuids) {
//     return this.queryLocalBackupStorageService.getUniqCdpTaskCount(backupStorageUuids)
//   }
// }

// 一个BackupJob中有多个BS 所以有个重复的问题。
@Resolver(() => LocalBackupStorageOfBackupJobSummary)
export class LocalBackupStorageOfBackupJobSummaryResolver {
  @Inject() queryLocalBackupStorageService: QueryLocalBackupStorageService

  @Query(() => LocalBackupStorageOfBackupJobSummary)
  async getLocalBackupStorageOfBackupJobSummary(
    @Args({ name: 'backupStorageUuids', type: () => [String] })
    backupStorageUuids: string[]
  ) {
    return backupStorageUuids || []
  }

  @ResolveField(() => Int)
  async total(@Parent() backupStorageUuids) {
    return this.queryLocalBackupStorageService.getUniqBackupJobCount(backupStorageUuids)
  }
}
