import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { PrimaryStorageCapacity } from '@/maintenance/capacity-calculation/capacity-calculation.model'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'

import {
  SharedBlock,
  SharedBlockResponse,
  CandidateSharedBlockResponse,
  CandidateSharedBlock,
  SharedBlockGroupLunsResponse
} from './shared-block.model'
import { SharedBlockService } from './shared-block.service'

@Resolver(() => SharedBlock)
export class SharedBlockResolver {
  constructor(private sharedBlockService: SharedBlockService) {}
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  /**
   * 共享块列表
   * @param param QueryAction
   */
  @Query(() => SharedBlockResponse)
  async sharedBlockList(@Args() param: QueryAction) {
    return this.sharedBlockService.sharedBlockList(param)
  }

  @ResolveField()
  async sharedBlockCapacity(@Parent() sharedBlock: SharedBlock) {
    return this.sharedBlockService.getSharedBlockCapacity(sharedBlock.uuid)
  }

  @ResolveField(() => PrimaryStorageCapacity)
  async primaryStorageCapacity(@Parent() @Parent() sharedBlock: SharedBlock) {
    return this.capacityCalculationQueryService.getPrimaryStorageCapacity({
      primaryStorageUuids: [sharedBlock.sharedBlockGroupUuid]
    })
  }

  @ResolveField()
  async source(@Parent() sharedBlock: SharedBlock) {
    const wwid = sharedBlock?.diskUuid

    return this.sharedBlockService.getSource(wwid)
  }

  /**
   * 发现未纳管的主存储（共享块 VG）
   *
   * 添加数据存储时，用于按集群发现未纳管的 VG。
   * 底层调用 APIDiscoverStrangePrimaryStorageMsg。
   */
  @Query(() => SharedBlockGroupLunsResponse, {
    name: 'getSharedBlockGroupLuns',
    description: '按集群发现未纳管的共享块 VG'
  })
  async getSharedBlockGroupLuns(@Args('clusterUuid', { type: () => String }) clusterUuid: string) {
    return this.sharedBlockService.getSharedBlockGroupLuns(clusterUuid)
  }
}

@Resolver(() => CandidateSharedBlock)
export class CandidateSharedBlockResolver {
  @Inject() sharedBlockService: SharedBlockService
  /**
   * 共享块设备候选清单
   * @param param QueryAction
   */
  @Query(() => CandidateSharedBlockResponse)
  async candidateSharedBlockList(@Args() param: QueryAction) {
    return this.sharedBlockService.candidateSharedBlockList(param)
  }
}
