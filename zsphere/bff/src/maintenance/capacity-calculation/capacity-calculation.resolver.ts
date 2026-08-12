import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import {
  HostCpuMemoryCapacity,
  LocalStorageHostCapacity,
  PrimaryStorageCapacity,
  QueryHostCpuMemoryCapacityArgs,
  QueryLocalStorageHostCapacityArgs,
  QueryPrimaryStorageCapacityArgs
} from './capacity-calculation.model'
import { CapacityCalculationQueryService } from './query/capacity-calculation-query.service'

@Resolver(() => HostCpuMemoryCapacity)
export class HostCpuMemoryCapacityCalculationResolver {
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  @Query(() => HostCpuMemoryCapacity)
  async hostCpuMemoryCapacity(@Args() queryArgs: QueryHostCpuMemoryCapacityArgs) {
    const res = await this.capacityCalculationQueryService.getHostCpuMemoryCapacity(queryArgs)
    return {
      ...res,
      timestamp: new Date().getTime()
    }
  }
}

@Resolver(() => PrimaryStorageCapacity)
export class PrimaryStorageCapacityCapacityCalculationResolver {
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  @Query(() => PrimaryStorageCapacity)
  async primaryStorageCapacity(@Args() queryArgs: QueryPrimaryStorageCapacityArgs) {
    const res = await this.capacityCalculationQueryService.getPrimaryStorageCapacity(queryArgs)
    return {
      ...res,
      timestamp: new Date().getTime()
    }
  }
}

@Resolver(() => LocalStorageHostCapacity)
export class LocalStorageHostCapacityCapacityCalculationResolver {
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  @Query(() => LocalStorageHostCapacity)
  async localStorageHostCapacity(@Args() queryArgs: QueryLocalStorageHostCapacityArgs) {
    const res = await this.capacityCalculationQueryService.getLocalStorageHostCapacity(queryArgs)

    return {
      ...res,
      timestamp: new Date().getTime()
    }
  }
}
