import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { VmCdRomInventory } from '@/api/zstack/types'
import { QueryAction } from '@/common/model/action-query.model'

import { CdRom, CdRomsQueryResp, MaxAmount, VMCdRomConfig } from './cdroms.model'
import { CdRomsService } from './cdroms.service'

@Resolver(() => CdRom)
export class CdRomsResolver {
  @Inject() cdRomsService: CdRomsService

  @Query(() => CdRom, { nullable: true })
  cdrom(@Args('uuid') uuid: string): Promise<VmCdRomInventory> {
    return this.cdRomsService.queryByUuid(uuid)
  }

  @Query(() => CdRomsQueryResp)
  cdromList(@Args() queryArgs: QueryAction): Promise<CdRomsQueryResp> {
    return this.cdRomsService.query(queryArgs)
  }

  @Query(() => MaxAmount)
  async maxAmount(@Args('vmInstanceUuid') vmInstanceUuid: string): Promise<any> {
    const r = await this.cdRomsService.maxAmount(vmInstanceUuid)
    return { createAble: r }
  }

  @Query(() => CdRomsQueryResp)
  async vmCdRoms(@Args('vmInstanceUuid') vmInstanceUuid: string): Promise<CdRomsQueryResp> {
    return await this.cdRomsService.query({
      conditions: [{ key: 'vmInstance.uuid', value: vmInstanceUuid }]
    })
  }

  @Query(() => VMCdRomConfig)
  async vmCdRomsConfig() {
    return await this.cdRomsService.queryMaxCdRom()
  }

  @ResolveField('isoName', () => String, { nullable: true })
  async getIsoName(@Parent() CdRom: CdRom) {
    return await this.cdRomsService.queryIsoName(CdRom.isoUuid)
  }
}
