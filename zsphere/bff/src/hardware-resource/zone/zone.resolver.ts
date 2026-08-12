import { Inject } from '@nestjs/common'
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import {
  Zone as IZone,
  ZoneRelatedSummary,
  ZoneResponse as IZoneResponse,
  VirtualizationZoneRelatedSummary
} from './zone.model'
import { ZoneService } from './zone.service'

@Resolver(() => IZone)
export class ZoneResolver {
  @Inject() zoneService: ZoneService

  @Query(() => IZone, { nullable: true })
  async zone(@Args('uuid') uuid: string) {
    return await this.zoneService.getZone(uuid)
  }

  @Query(() => IZoneResponse)
  async zoneList(@Args() queryParams: QueryAction) {
    return await this.zoneService.getZoneList(queryParams)
  }

  @ResolveField('clusterCount')
  async clusterCount(@Parent() zone: IZone) {
    return await this.zoneService.getCount(zone.uuid, 'Cluster')
  }

  @ResolveField('primaryStorageCount')
  async primaryStorageCount(@Parent() zone: IZone) {
    return await this.zoneService.getCount(zone.uuid, 'PrimaryStorage')
  }

  @ResolveField('l2NetworkCount')
  async l2NetworkCount(@Parent() zone: IZone) {
    return await this.zoneService.getCount(zone.uuid, 'L2Network')
  }

  @ResolveField('vmInstanceCount')
  async vmInstanceCount(@Parent() zone: IZone) {
    return await this.zoneService.getCount(zone.uuid, 'VmInstance')
  }

  @ResolveField('volumeCount')
  async volumeCount(@Parent() zone: IZone) {
    return await this.zoneService.getCount(zone.uuid, 'Volume')
  }

  @ResolveField('backupStorageCount')
  async backupStorageCount(@Parent() zone: IZone) {
    return await this.zoneService.getCount(zone.uuid, 'BackupStorage')
  }

  @ResolveField('hostCount')
  async hostCount(@Parent() zone: IZone) {
    return await this.zoneService.getCount(zone.uuid, 'Host')
  }

  @Query(() => ZoneRelatedSummary)
  async zoneRelatedSummary(@Args('uuid') uuid: string): Promise<ZoneRelatedSummary> {
    return this.zoneService.getZoneRelatedSummary(uuid)
  }

  //--以下为虚拟化新增字段--

  /**
   * 物理机详情配置tab页左侧统计条数
   * @param uuid
   */
  @Query(() => VirtualizationZoneRelatedSummary)
  async getVirtualizationZoneRelatedSummary(
    @Args('uuid') uuid: string
  ): Promise<VirtualizationZoneRelatedSummary> {
    return this.zoneService.getVirtualizationZoneRelatedSummary(uuid)
  }
}
