import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { CephPrimaryStoragePoolCapacity } from '@/maintenance/capacity-calculation/capacity-calculation.model'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'

import { PrimaryStorageDataloader } from '../primary-storage/primary-storage.dataloader'
import { CephPrimaryStoragePoolQueryService } from './ceph-primary-storage-pool-query/ceph-primary-storage-pool-query.service'
import {
  CephPrimaryStoragePool,
  CephPrimaryStoragePoolList
} from './ceph-primary-storage-pool.model'
@Resolver(() => CephPrimaryStoragePool)
export class CephPrimaryStoragePoolResolver {
  @Inject()
  cephPrimaryStoragePoolQueryService: CephPrimaryStoragePoolQueryService
  @Inject() primaryStorageDataloader: PrimaryStorageDataloader
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  @Query(() => CephPrimaryStoragePoolList)
  async cephPrimaryStoragePoolList(@Args() queryArgs: QueryAction) {
    return this.cephPrimaryStoragePoolQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async primaryStorage(@Parent() cephPrimaryStoragePool: CephPrimaryStoragePool) {
    return await this.primaryStorageDataloader.query(
      cephPrimaryStoragePool.uuid,
      cephPrimaryStoragePool.primaryStorageUuid
    )
  }

  @ResolveField()
  async primaryStorageCapacity(@Parent() cephPrimaryStoragePool: CephPrimaryStoragePool) {
    const res = await this.capacityCalculationQueryService.getPrimaryStorageCapacity({
      primaryStorageUuids: [cephPrimaryStoragePool.primaryStorageUuid]
    })
    return {
      ...res
    }
  }

  @ResolveField(() => CephPrimaryStoragePoolCapacity)
  async cephPrimaryStoragePoolCapacity(@Parent() cephPrimaryStoragePool: CephPrimaryStoragePool) {
    const res = await this.capacityCalculationQueryService.getPrimaryStoragePoolCapacity({
      primaryStorageUuid: cephPrimaryStoragePool.primaryStorageUuid,
      poolName: cephPrimaryStoragePool.poolName
    })

    return {
      ...res
    }
  }

  @ResolveField()
  name(@Parent() parent: CephPrimaryStoragePool) {
    return parent.poolName
  }
}
