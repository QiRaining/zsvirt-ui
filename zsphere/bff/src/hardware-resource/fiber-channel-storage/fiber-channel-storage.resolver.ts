import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { FiberChannelStorageQueryService } from './fiber-channel-storage-query/fiber-channel-storage-query.service'
import { FiberChannelStorage, FiberChannelStorageList } from './fiber-channel-storage.model'

@Resolver(() => FiberChannelStorage)
export class FiberChannelStorageResolver {
  @Inject() fiberChannelStorageQueryService: FiberChannelStorageQueryService

  @Query(() => FiberChannelStorageList)
  async fiberChannelStorageList(@Args() queryArgs: QueryAction) {
    return this.fiberChannelStorageQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async lunDeviceUsageInfo(@Parent() fiberChannelStorage: FiberChannelStorage) {
    return await this.fiberChannelStorageQueryService.getLunDeviceUsageInfo(
      fiberChannelStorage.uuid,
      fiberChannelStorage
    )
  }

  @ResolveField()
  async zones(@Parent() fiberChannelStorage: FiberChannelStorage) {
    return await this.fiberChannelStorageQueryService.getZones(
      fiberChannelStorage.uuid,
      fiberChannelStorage
    )
  }
}
