import { Inject } from '@nestjs/common'
import { Args, Query, Parent, Resolver, ResolveField, Int, Mutation, Float } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { Condition, QueryAction } from '@/common/model/action-query.model'

import {
  BackupStorage,
  BackupStorageList,
  QueryBsArgs,
  BackupStorageMetricData,
  BackupStorageSummary,
  CheckHostnameRepeatResult,
  CheckHostnameRepeatParam,
  FreeHardDiskInfoList
} from './backup-storage.model'
import { BackupStorageService } from './backup-storage.service'

@Resolver(() => BackupStorage)
export class BackupStorageResolver {
  @Inject() backupStorageService: BackupStorageService

  // get backup-storage types
  @Query(() => [String])
  backupStorageTypes(): Promise<string[]> {
    return this.backupStorageService.getBackupStorageTypes({})
  }

  @ResolveField()
  async zone(@Parent() backupStorage: BackupStorage) {
    return this.backupStorageService.getZone(backupStorage.attachedZoneUuids[0])
  }

  @ResolveField()
  async dataNetwork(@Parent() backupStorage: BackupStorage) {
    return this.backupStorageService.getDataNetwork(backupStorage.uuid)
  }

  @ResolveField()
  async syncImageNetwork(@Parent() backupStorage: BackupStorage) {
    return this.backupStorageService.getSyncImageNetwork(backupStorage.uuid)
  }

  @ResolveField(() => [String])
  async systemTag(@Parent() backupStorage: BackupStorage) {
    return this.backupStorageService.getBackupStorageSystemTag(backupStorage.uuid)
  }

  @ResolveField('reservedCapacity', () => Float)
  async reservedCapacity(@Parent() backupStorage: BackupStorage) {
    return await this.backupStorageService.getReservedCapacity(backupStorage.uuid)
  }

  // search query
  @Query(() => BackupStorageList)
  async backupStorageList(@Args() queryArgs: QueryBsArgs) {
    return this.backupStorageService.queryList(queryArgs)
  }

  @Query(() => BackupStorage)
  async backupStorage(@Args('uuid') uuid: string) {
    const queryArgs: QueryBsArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }
    const result = await this.backupStorageService.queryList(queryArgs)
    return result.list[0]
  }

  @Query(() => [BackupStorageMetricData])
  async backupStorageMetricDataList(
    @Args({ name: 'uuid', type: () => String }) uuid: string,
    @Args({ name: 'namespace', type: () => String }) namespace: string,
    @Args({ name: 'metricName', type: () => String }) metricName: string,
    @Args({ name: 'period', type: () => Number }) period: number,
    @Args({ name: 'offsetAheadOfCurrentTime', type: () => Number })
    offsetAheadOfCurrentTime: number,
    @Args({ name: 'labels', type: () => [String], nullable: true })
    labels: string[]
  ) {
    return await this.backupStorageService.getBackupStorageMetricDataList(
      uuid,
      namespace,
      metricName,
      period,
      offsetAheadOfCurrentTime,
      labels
    )
  }

  @Mutation(() => CheckHostnameRepeatResult)
  async checkHostnameRepeat(@Args('input') input: CheckHostnameRepeatParam) {
    return await this.backupStorageService.checkHostnameRepeat(input)
  }

  @Query(() => FreeHardDiskInfoList)
  async getFreeHardDiskInfoList(@Args() args: QueryAction) {
    return this.backupStorageService.getFreeHardDiskInfoList(args)
  }
}

@Resolver(() => BackupStorageSummary)
export class BackupStorageSummaryResolver {
  @Inject() backupStorageService: BackupStorageService

  @Query(() => BackupStorageSummary)
  async backupStorageSummary(
    @Args({ name: 'conditions', type: () => [Condition], nullable: true })
    conditions?: Condition[]
  ) {
    return conditions || []
  }

  @ResolveField(() => Int)
  async total(conditions: [Condition]) {
    return this.backupStorageService.getSummary('total', conditions)
  }

  @ResolveField(() => Int)
  async connected(@Parent() conditions) {
    return this.backupStorageService.getSummary('connected', conditions)
  }

  @ResolveField(() => Int)
  async connecting(@Parent() conditions) {
    return this.backupStorageService.getSummary('connecting', conditions)
  }

  @ResolveField(() => Int)
  async disconnected(@Parent() conditions) {
    return this.backupStorageService.getSummary('disconnected', conditions)
  }

  @ResolveField(() => Int)
  async other(@Parent() conditions) {
    return this.backupStorageService.getSummary('other', conditions)
  }
}
