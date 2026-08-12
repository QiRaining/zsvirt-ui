import { Inject } from '@nestjs/common'
import { Args, Context, Info, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryHostNetworkInterfaceAction } from '@/api/zstack/QueryHostNetworkInterfaceAction'
import { HostStatus } from '@/common/enum'
import { Condition as ICondition } from '@/common/model/action-query.model'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'
import { Bond } from '@/hardware-resource/bond/bond.model'
import { LocalStorageHostCapacity } from '@/maintenance/capacity-calculation/capacity-calculation.model'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { Decrypt } from '@/utils/aesCipher'
import { TagsDataloader } from '@/zsphere-administration/tag/tag.dataloader'
import { ResourceAttributeFieldResolver } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.resolver'

import { Cluster } from '../cluster/cluster.model'
import {
  GetHostMetricDataListArgs,
  HostHardwareInfo,
  HostIommu,
  HostMetricData,
  HostPowerControlRelatedSummary,
  HostQueryResp,
  HostQueryType,
  HostRelatedSummary,
  HostSlotInfo,
  HostSummary,
  HostSystemInfo,
  HostUsage,
  HostVO,
  HostWebTerminal,
  KernelInterfaces,
  QueryHostArgs
} from './host.model'
import { HostService } from './host.service'
import { HostQueryService } from './query/host-query.service'
import { HardWareSummary, HardwareSummaryService } from './query/summary.service'

@Resolver(() => HostVO)
export class HostResolver extends ResourceAttributeFieldResolver {
  @Inject()
  hostService: HostService
  @Inject()
  hostQueryService: HostQueryService
  @Inject()
  queryHostNetworkInterfaceAction: QueryHostNetworkInterfaceAction
  @Inject()
  tagsDataloader: TagsDataloader

  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService

  @Query(() => HostQueryResp)
  async hostList(@Args() args: QueryHostArgs) {
    return await this.hostQueryService.query(args)
  }

  @Query(() => HostQueryResp)
  async countHostList(@Args() args: QueryHostArgs) {
    return await this.hostQueryService.query(args, ZQLAction.COUNT)
  }

  @Query(() => HostVO)
  async host(@Args('uuid') uuid: string) {
    const queryArgs: QueryHostArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }
    const result = await this.hostQueryService.query(queryArgs)
    return result?.list[0]
  }

  @ResolveField(() => Cluster)
  async cluster(@Parent() host: HostVO) {
    return await this.hostQueryService.getCluster(host.uuid, host.clusterUuid)
  }
  @ResolveField()
  async tag(@Parent() host: HostVO) {
    return await this.tagsDataloader.query(host.uuid)
  }
  @ResolveField()
  async owner(@Parent() host: HostVO) {
    return await this.hostQueryService.getOwner(host.uuid)
  }
  @ResolveField()
  async hostTopology(@Parent() host: HostVO) {
    if (host?.status === HostStatus.Connected) {
      return await this.hostQueryService.getHostNUMATopology(host.uuid)
    } else {
      return null
    }
  }
  @ResolveField()
  async zone(@Parent() host: HostVO) {
    return await this.hostQueryService.getZone(host.uuid, host.zoneUuid)
  }
  @ResolveField()
  async localStorageHostDiskCapacity(
    @Parent() host: HostVO,
    @Args('primaryStorageUuid', { nullable: true }) primaryStorageUuid: string
  ) {
    return await this.hostQueryService.getLocalStorageHostDiskCapacity(
      host.uuid,
      primaryStorageUuid
    )
  }
  @ResolveField()
  async hostSystemInfo(@Parent() host: HostVO) {
    return await this.hostQueryService.getSystemInfo(host.uuid)
  }
  @ResolveField()
  async hostIommu(@Parent() host: HostVO) {
    return await this.hostQueryService.getHostIommu(host.uuid)
  }
  @ResolveField()
  async globalConifg(@Parent() host: HostVO) {
    return await this.hostQueryService.getGlobalConifg(host.uuid, host.clusterUuid)
  }
  @ResolveField()
  async hostZWatchInfo(@Parent() host: HostVO) {
    return await this.hostQueryService.getZWatchInfo(host.uuid)
  }
  @ResolveField()
  async relatedVmCount(@Parent() host: HostVO) {
    return await this.hostQueryService.getRelatedVmCount(host.uuid)
  }

  @ResolveField()
  async qemuState(@Parent() host: HostVO) {
    return await this.hostQueryService.getHostQemuState(host.uuid)
  }

  @ResolveField()
  async hostGroup(@Parent() host: HostVO) {
    return await this.hostQueryService.getHostGroup(host.uuid)
  }

  @ResolveField()
  async relatedVolumeCount(@Parent() host: HostVO) {
    return await this.hostQueryService.getRelatedVolumeCount(host.uuid)
  }

  @ResolveField(() => [Bond], { nullable: true })
  async bondRelatedVSwitch(@Parent() host: HostVO, @Info() info) {
    if (info?.variableValues?.type !== HostQueryType.GetHostNotInVSwitch) {
      return []
    }
    return await this.hostQueryService.getBondRelatedVSwitch(host.uuid, info.variableValues)
  }

  @ResolveField(() => String, { nullable: true })
  async callBackIp(@Parent() host: HostVO) {
    return await this.hostQueryService.getCallBackIp(host.uuid)
  }

  @ResolveField()
  async extraIps(@Parent() host: HostVO) {
    return await this.hostQueryService.getExtraips(host.uuid)
  }

  @ResolveField()
  async connectedTime(@Parent() host: HostVO) {
    return await this.hostQueryService.getConnectedTime(host.uuid)
  }

  @ResolveField()
  async hostNodeInfo(@Parent() host: HostVO) {
    return await this.hostQueryService.getHostNodeInfo(host.uuid)
  }

  @ResolveField()
  physicalNicList(@Parent() host: HostVO) {
    return this.hostQueryService.physicalNicList(host.uuid)
  }

  @ResolveField()
  bondList(@Parent() host: HostVO) {
    return this.hostQueryService.bondList(host.uuid)
  }

  @ResolveField(() => HostUsage, { nullable: false })
  async hostUsage(@Parent() host: HostVO) {
    return await this.hostQueryService.getHostUsageList(host.uuid)
  }

  @ResolveField(() => LocalStorageHostCapacity)
  async localStorageHostCapacity(@Parent() host: HostVO, @Context() context: any) {
    const { conditions = [] } = context?.req?.body?.variables ?? {}

    const primaryStorageUuid =
      conditions.find(item => item.key === 'cluster.primaryStorage.uuid').value ?? ''

    const res = await this.capacityCalculationQueryService.getLocalStorageHostCapacity({
      hostUuid: host.uuid,
      primaryStorageUuid
    })

    return {
      ...res,
      timestamp: new Date().getTime()
    }
  }

  @ResolveField(() => KernelInterfaces)
  async kernelInterfaces(@Parent() host: HostVO, @Context() context: any) {
    const { conditions = [] } = context?.req?.body?.variables ?? {}

    const externalNetwork = conditions.find(item => item.key === 'externalNetwork')?.value ?? ''

    const internalNetwork = conditions.find(item => item.key === 'internalNetwork')?.value ?? ''

    return await this.hostQueryService.getKernelInterfaces({
      hostUuid: host.uuid,
      externalNetwork,
      internalNetwork
    })
  }

  @Query(() => HostIommu)
  async getHostIommu(@Args('uuid') uuid: string): Promise<HostIommu> {
    return await this.hostQueryService.getCurrentHostIommu(uuid)
  }

  /**
   * 物理机详情配置tab页左侧统计条数
   * @param uuid
   */
  @Query(() => HostRelatedSummary)
  async getHostRelatedSummary(@Args('uuid') uuid: string): Promise<HostRelatedSummary> {
    return this.hostService.getHostRelatedSummary(uuid)
  }

  /**
   * 物理机电源控制资源数据
   * @param uuid
   */
  @Query(() => HostPowerControlRelatedSummary)
  async getHostPowerControlRelatedSummary(
    @Args('uuids', { type: () => [String] }) uuids: string[]
  ): Promise<HostPowerControlRelatedSummary> {
    return this.hostService.getHostPowerControlRelatedSummary(uuids)
  }

  /**
   * 物理机详情页监控信息
   * @param args
   */
  @Query(() => [[HostMetricData]])
  async hostMetricData(
    @Args()
    { uuid, startTime, endTime, period, metricNames }: GetHostMetricDataListArgs
  ) {
    return await this.hostService.getHostMetricData(uuid, startTime, endTime, period, metricNames)
  }

  @Query(() => HostSystemInfo)
  async queryHostSystemInfo(@Args('uuid') uuid: string) {
    return await this.hostQueryService.getSystemInfo(uuid)
  }
}

@Resolver(() => HostSummary)
export class HostSummaryResolver {
  @Inject() hostQueryService: HostQueryService

  @Query(() => HostSummary)
  async hostSummary(
    @Args({ name: 'conditions', type: () => [ICondition], nullable: true })
    conditions?: ICondition[]
  ) {
    return conditions || []
  }

  @ResolveField(() => Int)
  async total(conditions: [ICondition]) {
    return this.hostQueryService.getSummary('total', conditions)
  }

  @ResolveField(() => Int)
  async enabled(conditions: [ICondition]) {
    return await this.hostQueryService.getSummary('enabled', conditions)
  }

  @ResolveField(() => Int)
  async disabled(conditions: [ICondition]) {
    return await this.hostQueryService.getSummary('disabled', conditions)
  }

  @ResolveField(() => Int)
  async maintenance(conditions: [ICondition]) {
    return await this.hostQueryService.getSummary('maintenance', conditions)
  }

  @ResolveField(() => Int)
  async connected(@Parent() conditions) {
    return this.hostQueryService.getSummary('connected', conditions)
  }

  @ResolveField(() => Int)
  async connecting(@Parent() conditions) {
    return this.hostQueryService.getSummary('connecting', conditions)
  }

  @ResolveField(() => Int)
  async disconnected(@Parent() conditions) {
    return this.hostQueryService.getSummary('disconnected', conditions)
  }

  @ResolveField(() => Int)
  async other(@Parent() conditions) {
    return this.hostQueryService.getSummary('other', conditions)
  }
}

@Resolver(() => HostHardwareInfo)
export class HostHardwareInfoResolver {
  @Inject() HardwareSummaryService: HardwareSummaryService
  @Inject() zqlService: ZQLService

  @Query(() => HostHardwareInfo)
  async hostHardwareInfo(@Args('uuid') uuid: string) {
    const info = await this.getHardwareInfo(uuid)

    return { uuid, ...info }
  }

  @Query(() => HostSlotInfo)
  async hostSlotInfo(@Args('uuid') uuid: string) {
    const info = await this.getSlotInfo(uuid)

    return { uuid, ...info }
  }

  @Query(() => HardWareSummary)
  async hostHardwareStatusSummary(@Args('uuid') uuid: string) {
    const info = await this.HardwareSummaryService.query({ hostUuid: uuid })

    return info
  }

  async getHardwareInfo(uuid: string) {
    const tagList = [
      'manufacturer',
      'productName',
      'serialNumber',
      'systemUuid',
      'uptime',
      'ipmiAddress',
      'bmcVersion',
      'biosVendor',
      'biosVersion',
      'biosReleaseDate'
    ]

    return this.getSystemTagInfo(uuid, tagList)
  }

  async getSlotInfo(uuid: string) {
    const tagList = ['memorySlotsMaximum']

    return this.getSystemTagInfo(uuid, tagList)
  }

  async getSystemTagInfo(uuid: string, tagList: string[]) {
    const systemPrefixList = ['manufacturer', 'serialNumber', 'productName']

    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      condition: {
        resourceUuid: uuid,
        [ZOp.or]: tagList.map(key => ({
          tag: {
            [Op.like]: systemPrefixList.includes(key) ? `system${key}` : key
          }
        }))
      }
    })

    const resp = await this.zqlService.call(zql)
    const inventories = resp.results?.[0]?.inventories || []
    const systemTagList = inventories.map(item => {
      const [key, value] = item.tag.split('::')
      return {
        key,
        value
      }
    })
    const obj = tagList.reduce((acc, key) => {
      const target = systemTagList.find(item => item.key.toLowerCase().includes(key.toLowerCase()))
      if (target && !['null', 'unknown', 'none'].includes(target.value.toLowerCase())) {
        acc[key] = target.value
      }
      return acc
    }, {})

    return obj
  }
}

@Resolver(HostUsage)
export class HostUsageResolver {
  @Inject() hostQueryService: HostQueryService

  @Query(() => HostUsage, { nullable: false })
  async hostUsage(@Args('uuid') uuid: string) {
    return await this.hostQueryService.getHostUsage(uuid)
  }
}

@Resolver(HostWebTerminal)
export class HostWebTerminalUrlResolver {
  @Inject() hostService: HostService
  @Query(() => HostWebTerminal, { nullable: false })
  async getHostWebTerminalUrl(
    @Args('uuid') uuid: string,
    @Args('username') username: string,
    @Args('password') password: string,
    @Args('https') https: boolean
  ) {
    const { url } = await this.hostService.getHostWebSshUrl(
      uuid,
      username,
      Decrypt(password),
      https
    )
    return { url }
  }
}
