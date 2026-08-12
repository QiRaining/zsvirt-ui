import { Inject } from '@nestjs/common'
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryZSVBackupStorageService } from './query/zsv-backup-storage-query'
import {
  ZSVBackupStorage,
  ZSVBackupStorageQueryResp,
  QueryZSVBackupStorageArgs,
  ScanZSVBackupStorage,
  ZSVBackupStorageOfBackupJobSummary,
  ZSVBackupStorageSystemTagsQueryResp
} from './zsv-backup-storage.model'

@Resolver(() => ZSVBackupStorage)
export class ZSVBackupStorageResolver {
  @Inject()
  queryZSVBackupStorageService: QueryZSVBackupStorageService

  @Query(() => ZSVBackupStorageQueryResp)
  async ZSVBackupStorageList(@Args() queryArgs: QueryZSVBackupStorageArgs) {
    return await this.queryZSVBackupStorageService.query(queryArgs)
  }

  @ResolveField(() => Number, { description: '备份存储关联的备份任务' })
  async backupJobCount(@Parent() backupStorage: ZSVBackupStorage) {
    return await this.queryZSVBackupStorageService.getBackupJobCount(backupStorage.uuid)
  }

  @ResolveField(() => String, { description: '备份存储类型' })
  async backupStorageType(@Parent() backupStorage: ZSVBackupStorage) {
    return await this.queryZSVBackupStorageService.getBackupStorageType(backupStorage.uuid)
  }

  @ResolveField(() => [String])
  async attachedZoneRefUuids(@Parent() backupStorage: ZSVBackupStorage) {
    return await this.queryZSVBackupStorageService.getBackupStorageAttachedZoneUuids(
      backupStorage.uuid
    )
  }

  @Query(() => ZSVBackupStorageSystemTagsQueryResp)
  async ZSVBackupStorageSystemTagsList(@Args() queryArgs: QueryZSVBackupStorageArgs) {
    return await this.queryZSVBackupStorageService.querySystemTags(queryArgs)
  }

  @Query(() => ScanZSVBackupStorage)
  async scanZSVBackupStorage(
    @Args({ name: 'backupStorageUuid' }) backupStorageUuid: string,
    @Args({ name: 'zoneUuid' }) zoneUuid: string
  ) {
    return await this.queryZSVBackupStorageService.scanZSVBackupStorage(backupStorageUuid, zoneUuid)
  }

  @Query(() => Boolean)
  async haveRemoteBackupStorage() {
    return await this.queryZSVBackupStorageService.haveRemoteBackupStorage()
  }
}

// 一个BackupJob中有多个BS 所以有个重复的问题。
@Resolver(() => ZSVBackupStorageOfBackupJobSummary)
export class ZSVBackupStorageOfBackupJobSummaryResolver {
  @Inject() queryZSVBackupStorageService: QueryZSVBackupStorageService

  @Query(() => ZSVBackupStorageOfBackupJobSummary)
  async getZSVBackupStorageOfBackupJobSummary(
    @Args({ name: 'backupStorageUuids', type: () => [String] })
    backupStorageUuids: string[]
  ) {
    return backupStorageUuids || []
  }

  @ResolveField(() => Int)
  async total(@Parent() backupStorageUuids) {
    return this.queryZSVBackupStorageService.getUniqBackupJobCount(backupStorageUuids)
  }
}
