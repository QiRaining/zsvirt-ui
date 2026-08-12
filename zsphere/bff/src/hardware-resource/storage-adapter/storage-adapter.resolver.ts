import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import {
  StorageAdapter,
  StorageAdapterCountResponse,
  StorageAdapterResponse
} from './storage-adapter.model'
import { StorageAdapterService } from './storage-adapter.service'

@Resolver(() => StorageAdapter)
export class StorageAdapterResolver {
  @Inject() private storageAdapterService: StorageAdapterService

  @Query(() => StorageAdapterResponse)
  async storageAdapterList(@Args() param: QueryAction) {
    return this.storageAdapterService.queryStorageAdapterList(param)
  }

  @Query(() => StorageAdapterCountResponse)
  async storageAdapterCount(@Args() param: QueryAction) {
    return this.storageAdapterService.countStorageAdapter(param)
  }
}
