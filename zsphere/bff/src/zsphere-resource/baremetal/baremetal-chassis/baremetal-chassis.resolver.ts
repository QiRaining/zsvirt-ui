import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent, Mutation } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import { ClusterDataloader } from '@/hardware-resource/cluster/cluster.dataloader'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { ZoneDataloader } from '@/hardware-resource/zone/zone.dataloader'
import { Zone } from '@/hardware-resource/zone/zone.model'

import {
  BaremetalChassis,
  BaremetalChassisQueryResp,
  BaremetalChassisNicInfoQueryResp,
  BaremetalChassisDiskInfoQueryResp
} from './baremetal-chassis.model'
import { BaremetalChassisService } from './baremetal-chassis.service'

@Resolver(() => BaremetalChassis)
export class BaremetalChassisResolver {
  @Inject() baremetalChassisService: BaremetalChassisService
  @Inject() zoneDataloader: ZoneDataloader
  @Inject() clusterDataloader: ClusterDataloader

  @Query(() => BaremetalChassisQueryResp)
  async baremetalChassisList(@Args() queryArgs: QueryAction): Promise<BaremetalChassisQueryResp> {
    return await this.baremetalChassisService.queryList(queryArgs)
  }

  @ResolveField(() => Cluster)
  async cluster(@Parent() { uuid, clusterUuid }: BaremetalChassis): Promise<Cluster> {
    return this.clusterDataloader.query(uuid, clusterUuid)
  }

  @ResolveField(() => Zone)
  async zone(@Parent() { uuid, zoneUuid }: BaremetalChassis): Promise<Zone> {
    return this.zoneDataloader.query(uuid, zoneUuid)
  }

  @Mutation(() => ActionSendResp)
  checkBaremetalChassisConfigFile(
    @Args('baremetalChassisInfo') baremetalChassisInfo: string
  ): Promise<ActionSendResp> {
    return this.baremetalChassisService.checkBaremetalChassisConfigFile({
      baremetalChassisInfo
    })
  }

  @Query(() => BaremetalChassisDiskInfoQueryResp)
  async baremetalChassisDiskInfoList(
    @Args() queryArgs: QueryAction
  ): Promise<BaremetalChassisDiskInfoQueryResp> {
    return await this.baremetalChassisService.queryDiskList(queryArgs)
  }

  @Query(() => BaremetalChassisNicInfoQueryResp)
  async baremetalChassisNicInfoList(
    @Args() queryArgs: QueryAction
  ): Promise<BaremetalChassisNicInfoQueryResp> {
    return await this.baremetalChassisService.queryNicList(queryArgs)
  }
}
