import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction as IQueryAction, QueryAction } from '@/common/model/action-query.model'
import { ClusterDataloader } from '@/hardware-resource/cluster/cluster.dataloader'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { ZoneDataloader } from '@/hardware-resource/zone/zone.dataloader'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { CommonOwner } from '@/zsphere-administration/owner/owner.model'
import { TagsDataloader } from '@/zsphere-administration/tag/tag.dataloader'
import { Tag } from '@/zsphere-administration/tag/tag.model'
import { ResourceAttributeFieldResolver } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.resolver'
import { BaremetalChassisDataloader } from '@/zsphere-resource/baremetal/baremetal-chassis/baremetal-chassis.dataloader'
import { BaremetalChassis } from '@/zsphere-resource/baremetal/baremetal-chassis/baremetal-chassis.model'
import {
  BaremetalDisk,
  BaremetalDiskList,
  BaremetalInstance,
  BaremetalInstanceConfigSummary,
  BaremetalInstanceList,
  BaremetalNic,
  BaremetalNicList,
  HardwareInfo
} from '@/zsphere-resource/baremetal/baremetal-instance/baremetal-instance.model'
import { BaremetalInstanceQueryService } from '@/zsphere-resource/baremetal/baremetal-instance/query/baremetal-instance-query.service'
import { BaremetalPxeserviceDataloader } from '@/zsphere-resource/baremetal/baremetal-pxe-server/baremetal-pxe-server.dataloader'
import { BaremetalPxeServer } from '@/zsphere-resource/baremetal/baremetal-pxe-server/baremetal-pxe-server.model'
import { ImageDataloader } from '@/zsphere-resource/image/image.dataloader'
import { Image } from '@/zsphere-resource/image/image.model'

@Resolver(() => BaremetalInstance)
export class BaremetalInstanceResolver extends ResourceAttributeFieldResolver {
  @Inject()
  baremetalInstanceQueryService: BaremetalInstanceQueryService
  @Inject()
  clusterDataloader: ClusterDataloader
  @Inject()
  baremetalPxeserviceDataloader: BaremetalPxeserviceDataloader
  @Inject() tagsDataloader: TagsDataloader
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() imageDataloader: ImageDataloader
  @Inject() zoneDataloader: ZoneDataloader
  @Inject() baremetalChassisDataloader: BaremetalChassisDataloader

  @Query(() => BaremetalInstanceList)
  async baremetalInstanceList(@Args() queryArgs: QueryAction) {
    return await this.baremetalInstanceQueryService.query(queryArgs)
  }

  @Query(() => BaremetalInstance)
  async baremetalInstance(@Args('uuid') uuid: string) {
    const queryArgs: IQueryAction = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }
    const result = await this.baremetalInstanceQueryService.query(queryArgs)
    return result.list[0]
  }

  @ResolveField(() => HardwareInfo)
  async hardwareInfo(@Parent() baremetalInstance: BaremetalInstance) {
    return this.baremetalInstanceQueryService.getHardwareInfo(baremetalInstance)
  }

  @ResolveField(() => Cluster)
  async cluster(@Parent() baremetalInstance: BaremetalInstance) {
    return this.clusterDataloader.query(baremetalInstance.uuid, baremetalInstance?.clusterUuid)
  }

  @ResolveField(() => BaremetalPxeServer)
  async baremetalPxeServer(@Parent() baremetalInstance: BaremetalInstance) {
    return this.baremetalPxeserviceDataloader.query(
      baremetalInstance.uuid,
      baremetalInstance.pxeServerUuid
    )
  }

  @ResolveField(() => [Tag])
  async tag(@Parent() baremetalInstance: BaremetalInstance) {
    return this.tagsDataloader.query(baremetalInstance.uuid)
  }

  @ResolveField(() => CommonOwner)
  async owner(@Parent() baremetalInstance: BaremetalInstance) {
    return this.ownerDataLoader.query(baremetalInstance.uuid)
  }

  @ResolveField(() => Image)
  async image(@Parent() baremetalInstance: BaremetalInstance) {
    return this.imageDataloader.query(baremetalInstance.uuid, baremetalInstance.imageUuid)
  }

  @ResolveField(() => Zone)
  async zone(@Parent() baremetalInstance: BaremetalInstance) {
    return this.zoneDataloader.query(baremetalInstance.uuid, baremetalInstance.zoneUuid)
  }

  @ResolveField(() => BaremetalChassis)
  async baremetalChassis(@Parent() baremetalInstance: BaremetalInstance) {
    return this.baremetalChassisDataloader.query(
      baremetalInstance.uuid,
      baremetalInstance.chassisUuid
    )
  }

  @Query(() => BaremetalInstanceConfigSummary)
  async getBaremetalInstanceConfigSummary(
    @Args('uuid') uuid: string,
    @Args('chassisUuid') chassisUuid: string
  ) {
    const result = await this.baremetalInstanceQueryService.getBaremetalInstanceConfigSummary(
      uuid,
      chassisUuid
    )
    return result
  }
}

@Resolver(() => BaremetalNic)
export class BaremetalNicResolver {
  @Inject()
  baremetalInstanceQueryService: BaremetalInstanceQueryService
  @Inject()
  l3NetworkDataloader: L3NetworkDataloader

  @Query(() => BaremetalNicList)
  async baremetalNicList(@Args() queryArgs: QueryAction) {
    return await this.baremetalInstanceQueryService.queryBaremetalNicList(queryArgs)
  }

  @ResolveField(() => L3Network)
  async l3Network(@Parent() baremetalnic: BaremetalNic) {
    return this.l3NetworkDataloader.query(baremetalnic.uuid, baremetalnic.l3NetworkUuid)
  }
}

@Resolver(() => BaremetalDisk)
export class BaremetalDiskResolver {
  @Inject()
  baremetalInstanceQueryService: BaremetalInstanceQueryService

  @Query(() => BaremetalDiskList)
  async baremetalDiskList(@Args() queryArgs: QueryAction) {
    return await this.baremetalInstanceQueryService.queryBaremetalDiskList(queryArgs)
  }
}
