import { Inject } from '@nestjs/common'
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { cloneDeep, max } from 'lodash'

import { GetVpcVRouterNetworkServiceStateAction } from '@/api/zstack/GetVpcVRouterNetworkServiceStateAction'
import { MetricData } from '@/common/metric-data/metric-data.model'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import { QueryAction } from '@/common/model/action-query.model'
import { PhysicalNic } from '@/hardware-resource/pci-device/pci-device.model'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { SecurityGroup } from '@/network-service/security-group/security-group.model'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'
import {
  CheckMacAvailabilityParam,
  CheckMacAvailabilityResult,
  GetNicMetricDataResp,
  UsedIp,
  VmNic,
  VmNicSecurityPolicy
} from '@/zsphere-resource/vm-nic/vm-nic.model'

import { QueryVmNicService } from './query/query.service'
import {
  CheckVNicAvailabilityResult,
  CheckVNicIpAvailabilityParam,
  QueryVmNicArgs,
  VmNicAttachedNetworkServices,
  VmNicIpListResp,
  VmNicListResp,
  ZQLGetNicMetricDataArgs
} from './vm-nic.model'
import { VmNicService } from './vm-nic.service'

@Resolver(() => VmNic)
export class VmNicResolver {
  @Inject()
  getVpcVRouterNetworkServiceStateAction: GetVpcVRouterNetworkServiceStateAction
  @Inject() vmNicService: VmNicService
  @Inject() queryVmNicService: QueryVmNicService
  @Inject() MetricDataService: MetricDataService
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() l3NetworkDataloader: L3NetworkDataloader

  @Query(() => VmNicListResp)
  async vmNicList(@Args() queryArgs: QueryVmNicArgs) {
    return this.queryVmNicService.query(queryArgs)
  }

  @Query(() => VmNicIpListResp)
  async vmNicIpList(@Args() queryArgs: QueryAction) {
    return this.queryVmNicService.queryVmNicIPForEip(queryArgs)
  }

  queryMetric = async (args: ZQLGetNicMetricDataArgs['metricParam'] & { metricName: string }) => {
    const { startTime, endTime, period, namespace, conditions, metricName } = args
    const month_millisecond = 30 * 24 * 60 * 60 * 1000
    const timeGap = endTime - startTime
    // 监控数据最多只能获取 11000 条，超出报错，按一个月为基数分批获取
    const times = Math.floor(timeGap / month_millisecond)

    const sendQueryByTime = (sTime, eTime) =>
      this.MetricDataService.getMetricData(
        namespace,
        sTime,
        eTime,
        period,
        metricName,
        conditions,
        { fillZero: false }
      )

    const promiseArr = []
    // 请求times次，有余数的话是times+1次
    for (let i = 0; i < times; i++) {
      promiseArr.push(
        sendQueryByTime(
          // 时间需要去掉端点值，也就是在startTime的基础上加上period
          startTime + i * month_millisecond + period * 1000,
          startTime + (i + 1) * month_millisecond
        )
      )
    }
    // 非整除需要再请求一次余数
    let _startTime = startTime + times * month_millisecond
    if (_startTime !== endTime) {
      if (endTime - _startTime > period * 1000) {
        _startTime += period * 1000
      }
      promiseArr.push(sendQueryByTime(_startTime, endTime))
    }

    const metricDataList = await Promise.all(promiseArr)
    return metricDataList.flat()
  }

  @Query(() => GetNicMetricDataResp)
  async getNicMetricData(@Args() queryArgs: ZQLGetNicMetricDataArgs) {
    const { startTime, endTime } = queryArgs.metricParam
    const timeGap = Math.round((endTime - startTime) / 1000)
    const getValueList = (metricDataList: MetricData[]) => metricDataList.map(item => item.value)
    const getTotal = (metricDataList: MetricData[]) =>
      metricDataList.reduce((a, b) => a + b.value, 0)
    const getPercent95 = (valueList: number[]) =>
      cloneDeep(valueList)
        .sort((a, b) => a - b)
        .splice(0, Math.round(valueList.length * 0.95))
        .pop()

    const promiseArr = [
      'TotalNetworkInBytesIn5Min',
      'TotalNetworkOutBytesIn5Min'
      // 'NetworkInBytes',
      // 'NetworkOutBytes'
    ].map(async metricName =>
      this.queryMetric({
        ...queryArgs.metricParam,
        metricName,
        startTime
      })
    )

    const [
      NetworkInBytesTotalIn5Min,
      NetworkOutBytesTotalIn5Min
      // NetworkInBytes,
      // NetworkOutBytes
    ] = await Promise.all(promiseArr)

    const inTotal = getTotal(NetworkInBytesTotalIn5Min)
    const outTotal = getTotal(NetworkOutBytesTotalIn5Min)
    const inValueList = getValueList(NetworkInBytesTotalIn5Min).map(byte => byte / 300)
    const outValueList = getValueList(NetworkOutBytesTotalIn5Min).map(byte => byte / 300)

    return {
      in: {
        max: max(inValueList),
        total: inTotal,
        percent95: getPercent95(inValueList),
        average: inTotal / timeGap
      },
      out: {
        max: max(outValueList),
        total: getTotal(NetworkOutBytesTotalIn5Min),
        percent95: getPercent95(outValueList),
        average: outTotal / timeGap
      }
    } as GetNicMetricDataResp
  }

  @Query(() => [VmNic])
  async vmNic(@Args('uuid') uuid: string) {
    const conditions = [
      {
        key: 'uuid',
        value: uuid
      }
    ]
    const { list } = await this.queryVmNicService.query({ conditions })
    return list[0]
  }

  @Query(() => VmNicListResp)
  async getVmNicCount(@Args() queryArgs: QueryVmNicArgs) {
    return await this.queryVmNicService.query(queryArgs, true)
  }

  @ResolveField()
  async nicBandWidth(@Parent() vmNic: VmNic) {
    const res = await this.queryVmNicService.queryQosBandwidth({
      uuid: vmNic.uuid
    })
    return res
  }

  @ResolveField()
  async l3Network(@Parent() { uuid, l3NetworkUuid }: VmNic) {
    return await this.l3NetworkDataloader.query(uuid, l3NetworkUuid)
  }

  @ResolveField()
  async resourceConfig(@Parent() { uuid }: VmNic) {
    return await this.queryVmNicService.getResourceConfig(uuid)
  }

  @ResolveField()
  async snat(@Parent() { l3NetworkUuid, vmInstanceUuid: vpcUuid }: VmNic) {
    try {
      // 不是路由器的网卡不需要返回这个字段。
      const res = await this.getVpcVRouterNetworkServiceStateAction.call({
        l3NetworkUuid,
        uuid: vpcUuid,
        networkService: 'SNAT'
      })
      return res?.state === 'enable'
    } catch (e) {
      return null
    }
  }

  @ResolveField()
  async vmInstance(@Parent() { uuid, vmInstanceUuid }: VmNic) {
    if (!vmInstanceUuid) {
      return null
    }
    return await this.vmInstanceDataloader.query(uuid, vmInstanceUuid)
  }

  @ResolveField()
  async templatedVmInstance(@Parent() current: VmNic) {
    if (!current?.vmInstanceUuid) {
      return null
    }
    return await this.vmInstanceDataloader.queryTemplatedVmInstance(current.vmInstanceUuid)
  }

  @ResolveField()
  async eip(@Parent() vmNic: VmNic) {
    return this.queryVmNicService.getEip(vmNic.uuid)
  }

  @ResolveField(() => Boolean)
  async isBindPortMirrorSession(@Parent() { uuid }: VmNic) {
    return this.queryVmNicService.queryIsBindPortMirrorSession(uuid)
  }

  @ResolveField(() => [SecurityGroup])
  securityGroup(@Parent() { uuid }: VmNic) {
    return this.queryVmNicService.securityGroup(uuid)
  }

  @ResolveField(() => VmNicSecurityPolicy)
  securityPolicy(@Parent() { uuid }: VmNic) {
    return this.queryVmNicService.securityPolicy(uuid)
  }

  @ResolveField(() => PhysicalNic)
  physicalNic(@Parent() vmNic: VmNic) {
    return this.queryVmNicService.getPhysicalNic(vmNic.vmInstanceUuid, vmNic.l3NetworkUuid)
  }

  @Query(() => [L3Network])
  async getVmAttachableL3Network(
    @Args('vmInstanceUuid') vmInstanceUuid: string
  ): Promise<L3Network[]> {
    return this.vmNicService.getVmAttachableL3Network({ vmInstanceUuid })
  }

  @Query(() => VmNicAttachedNetworkServices)
  async getVmNicAttachedNetworkService(@Args('vmNicUuid') vmNicUuid: string) {
    return this.vmNicService.getVmNicAttachedNetworkService({ vmNicUuid })
  }

  @Mutation(() => CheckMacAvailabilityResult)
  async checkMacAvailability(@Args('input') input: CheckMacAvailabilityParam) {
    return await this.vmNicService.checkMacAvailability(input)
  }

  @Mutation(() => CheckVNicAvailabilityResult)
  async checkVNicIpAvailability(@Args('input') input: CheckVNicIpAvailabilityParam) {
    return await this.vmNicService.checkVNicIpAvailability(input)
  }

  @Query(() => CheckVNicAvailabilityResult)
  async queryVNicIpAvailability(@Args('input') param: CheckVNicIpAvailabilityParam) {
    return await this.vmNicService.checkVNicIpAvailability(param)
  }
}

@Resolver(() => UsedIp)
export class UsedIpResolver {
  @Inject() l3NetworkDataloader: L3NetworkDataloader

  @ResolveField()
  async l3Network(@Parent() usedIp: UsedIp) {
    return await this.l3NetworkDataloader.query(usedIp.uuid, usedIp.l3NetworkUuid)
  }
}
