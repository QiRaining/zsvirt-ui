import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ExternalPrimaryStoragePoolCapacity } from '@/maintenance/capacity-calculation/capacity-calculation.model'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'

import { QueryExternalPrimaryStoragePoolService } from './external-primary-storage-pool-query/external-primary-storage-pool-query.service'
import {
  ExternalPrimaryStoragePool,
  ExternalPrimaryStoragePoolList
} from './external-primary-storage-pool.model'

@Resolver(() => ExternalPrimaryStoragePool)
export class ExternalPrimaryStoragePoolResolver {
  @Inject()
  queryExternalPrimaryStoragePoolService: QueryExternalPrimaryStoragePoolService
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  @Query(() => ExternalPrimaryStoragePoolList, {
    name: 'externalPrimaryStoragePoolList',
    description: '获取外部存储池列表'
  })
  async getExternalPrimaryStoragePoolList(@Args() queryArgs: QueryAction) {
    return await this.queryExternalPrimaryStoragePoolService.query(queryArgs)
  }

  @ResolveField()
  async uuid(@Parent() extPrimaryStorage: ExternalPrimaryStoragePool) {
    return extPrimaryStorage.id
  }

  @ResolveField()
  async usedCapacity(@Parent() extPrimaryStorage: ExternalPrimaryStoragePool) {
    return (extPrimaryStorage.totalCapacity || 0) - (extPrimaryStorage.availableCapacity || 0)
  }

  @ResolveField()
  async primaryStorageCapacity(@Parent() extPrimaryStorage: ExternalPrimaryStoragePool) {
    const res = await this.capacityCalculationQueryService.getPrimaryStorageCapacity({
      primaryStorageUuids: [extPrimaryStorage.primaryStorageUuid]
    })
    return {
      ...res
    }
  }

  @ResolveField(() => ExternalPrimaryStoragePoolCapacity)
  async externalPrimaryStoragePoolCapacity(
    @Parent() extPrimaryStorage: ExternalPrimaryStoragePool
  ) {
    if (!extPrimaryStorage.primaryStorageUuid) {
      return {}
    }

    const res = await this.capacityCalculationQueryService.getPrimaryStoragePoolCapacity({
      primaryStorageUuid: extPrimaryStorage.primaryStorageUuid,
      poolName: extPrimaryStorage.name
    })

    return {
      ...res
    }
  }
}
