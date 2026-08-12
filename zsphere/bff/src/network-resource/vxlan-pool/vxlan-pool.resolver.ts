import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { Host } from '@/hardware-resource/host/host.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

import {
  AttachedVtepRefsType,
  VniRange,
  VniRangeResp,
  VxlanPool,
  VxlanPoolQueryResp,
  VxlanPoolQueryVtepResp,
  VxlanPoolRelatedResource
} from './vxlan-pool.model'
import { VxlanPoolService } from './vxlan-pool.service'

@Resolver(() => VxlanPool)
export class VxlanPoolResolver {
  @Inject() vxlanPoolService: VxlanPoolService
  @Inject() ownerLoader: OwnerDataLoader

  @Query(() => VxlanPoolQueryResp)
  async vxlanPoolList(@Args() queryArgs: QueryAction): Promise<VxlanPoolQueryResp> {
    return this.vxlanPoolService.query(queryArgs)
  }

  @Query(() => VxlanPoolRelatedResource)
  async vxlanPoolRelatedResource(
    @Args('uuid')
    uuid: string
  ): Promise<VxlanPoolRelatedResource> {
    return this.vxlanPoolService.vxlanpoolRelatedResource(uuid)
  }

  @Query(() => VniRangeResp)
  async vniRangeList(@Args() queryArgs: QueryAction): Promise<VniRangeResp> {
    return this.vxlanPoolService.queryVniRange(queryArgs)
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() VxlanPool: VxlanPool): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(VxlanPool.uuid)
  }

  @ResolveField('vniRange', () => [VniRange])
  vniRange(@Parent() vxlanPool: VxlanPool) {
    return this.vxlanPoolService.vniRange(vxlanPool.uuid)
  }
}

@Resolver(() => AttachedVtepRefsType)
export class VxlanPoolAttachedVtepResolver {
  @Inject() vxlanPoolService: VxlanPoolService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() hostLoader: HostDataloader

  @Query(() => VxlanPoolQueryVtepResp)
  async vxlanPoolAttachedVtep(@Args() queryArgs: QueryAction): Promise<VxlanPoolQueryVtepResp> {
    return this.vxlanPoolService.queryVtep(queryArgs)
  }

  @ResolveField('host', () => Host)
  async vxlanPoolVtepHost(@Parent() AttachedVtepRefsType: AttachedVtepRefsType): Promise<Host> {
    return await this.hostLoader.query(AttachedVtepRefsType.uuid, AttachedVtepRefsType.hostUuid)
  }
}
