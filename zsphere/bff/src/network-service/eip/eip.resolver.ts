import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { AccountOwner } from '@/zsphere-administration/owner/owner.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

import { Eip, EipListResp, QueryEipArgs } from './eip.model'
import { EipService } from './eip.service'

@Resolver(() => Eip)
export class EipResolver {
  @Inject() eipService: EipService

  @Inject() ownerDataLoader: OwnerDataLoader

  @Query(() => EipListResp)
  async eipList(@Args() queryArgs: QueryEipArgs) {
    return this.eipService.query(queryArgs)
  }

  @ResolveField(() => AccountOwner, { nullable: true })
  async owner(@Parent() eip: Eip) {
    return this.ownerDataLoader.query(eip.uuid)
  }

  @ResolveField(() => VmInstance)
  async vmInstance(@Parent() eip: Eip) {
    return this.eipService.getVmNic(eip.uuid, eip.vmNicUuid)
  }
}
