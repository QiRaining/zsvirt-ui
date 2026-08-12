import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { CBDPrimaryStoragePoolCapacity } from '@/maintenance/capacity-calculation/capacity-calculation.model'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'

import { QueryCBDPrimaryStoragePoolService } from './cbd-primary-storage-pool-query/query.service'
import {
  CBDPrimaryStoragePool,
  CBDPrimaryStoragePoolList,
  QuerCBDPrimaryStoragePoolyArgs
} from './cbd-primary-storage-pool.model'

@Resolver(() => CBDPrimaryStoragePool)
export class CBDPrimaryStoragePoolResolver {
  @Inject()
  queryCBDPrimaryStoragePoolService: QueryCBDPrimaryStoragePoolService
  @Inject()
  capacityCalculationQueryService: CapacityCalculationQueryService

  @Query(() => CBDPrimaryStoragePoolList, {
    name: 'cbdPrimaryStoragePoolList',
    description: '获取CBD存储池列表'
  })
  async cbdPrimaryStoragePoolList(@Args() queryArgs: QuerCBDPrimaryStoragePoolyArgs) {
    return await this.queryCBDPrimaryStoragePoolService.queryList(queryArgs)
  }

  @ResolveField()
  async uuid(@Parent() cbdPrimaryStorage: CBDPrimaryStoragePool) {
    return cbdPrimaryStorage.logicalPoolName
  }

  @ResolveField()
  async availableCapacity(@Parent() cbdPrimaryStorage: CBDPrimaryStoragePool) {
    return cbdPrimaryStorage.capacity - cbdPrimaryStorage.usedSize
  }

  @ResolveField()
  async primaryStorageCapacity(@Parent() cbdPrimaryStorage: CBDPrimaryStoragePool) {
    const res = await this.capacityCalculationQueryService.getPrimaryStorageCapacity({
      primaryStorageUuids: [cbdPrimaryStorage?.primaryStorageUuid]
    })
    return {
      ...res
    }
  }

  @ResolveField(() => CBDPrimaryStoragePoolCapacity)
  async cbdPrimaryStoragePoolCapacity(@Parent() cbdPrimaryStorage: CBDPrimaryStoragePool) {
    const primaryStorageUuid = cbdPrimaryStorage.primaryStorageUuid

    if (!primaryStorageUuid) {
      return {}
    }

    const res = await this.capacityCalculationQueryService.getPrimaryStoragePoolCapacity({
      primaryStorageUuid,
      poolName: cbdPrimaryStorage.logicalPoolName
    })

    return {
      ...res
    }
  }
}
