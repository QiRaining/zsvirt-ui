import { Inject } from '@nestjs/common'
import { Resolver, Query, ResolveField, Parent, Args, Int } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetMetricDataAction } from '@/api/zstack/GetMetricDataAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL from '@/common/zql/index'
import { L2Network } from '@/hardware-resource/l2-network/l2.network.model'
import { PciDeviceQueryService } from '@/hardware-resource/pci-device/pci-device-query/pci-device-query.service'
import {
  HostNetworkInterfaceServiceRef,
  PciDevice as IPciDevice,
  PciDeviceList as IPciDeviceList,
  PhysicalNicList as IPhysicalNicList,
  NicState,
  PhysicalNic,
  PhysicalNicCountResp,
  QueryPhysicalNicArgs,
  PhysicalNicLLDPDevice,
  QueryPhysicalNicLLDPDeviceArgs
  // UpdatePciDeviceInput as IUpdatePciDeviceInput
} from '@/hardware-resource/pci-device/pci-device.model'
import { PciDevicService } from '@/hardware-resource/pci-device/pci-device.service'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'

import { BondDataloader } from '../bond/bond.dataloader'
import { HostDataloader } from '../host/host.dataloader'
import { PhysicalNetworkService } from '../physical-network/physical-network.service'
import { HostInterfaceService } from './pci-device-query/host-interface.service'
import { PciDeviceForPhysicalNicDataloader } from './pci-device-query/physical-pci.data.loader'

@Resolver(() => IPciDevice)
export class PciDeviceResolver {
  @Inject() pciDeviceQueryService: PciDeviceQueryService
  @Inject() hostInterfaceService: HostInterfaceService
  @Inject() pciDevicService: PciDevicService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() vmInstanceDataloader: VmInstanceDataloader

  @Query(() => IPciDeviceList)
  async pciDeviceList(@Args() queryArgs: IQueryAction) {
    return this.pciDeviceQueryService.get(queryArgs)
  }

  @Query(() => [IPciDevice])
  async pciDevice(@Args() queryArgs: IQueryAction) {
    return this.pciDeviceQueryService.get(queryArgs)
  }

  @Query(() => IPhysicalNicList)
  async physicalNicList(@Args() queryArgs: QueryPhysicalNicArgs) {
    return this.hostInterfaceService.query(queryArgs)
  }

  @ResolveField()
  async pciDeviceSpec(@Parent() pciDevice: IPciDevice) {
    return this.pciDeviceQueryService.getPciDeviceSpec(pciDevice.uuid, pciDevice.pciSpecUuid)
  }

  @ResolveField()
  async host(@Parent() pciDevice: IPciDevice) {
    return this.pciDeviceQueryService.getHost(pciDevice.uuid, pciDevice.hostUuid)
  }

  @ResolveField()
  async hostNetworkInterface(@Parent() pciDevice: IPciDevice) {
    return this.pciDeviceQueryService.getHostNetworkInterface(pciDevice)
  }

  @ResolveField()
  async vmInstance(@Parent() pciDevice: IPciDevice) {
    return this.vmInstanceDataloader.query(pciDevice.uuid, pciDevice.vmInstanceUuid)
  }

  @ResolveField()
  async templatedVmInstance(@Parent() pciDevice: IPciDevice) {
    return this.vmInstanceDataloader.queryTemplatedVmInstance(pciDevice.vmInstanceUuid)
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() pciDevice: IPciDevice): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(pciDevice.uuid)
  }

  @ResolveField()
  async physicalNicDeviceMaxPartNum(@Parent() pciDevice: IPciDevice) {
    return this.pciDeviceQueryService.getPhysicalNicDeviceMaxPartNum(pciDevice)
  }

  @ResolveField()
  async canDirectRestore(@Parent() pciDevice: IPciDevice) {
    return this.pciDeviceQueryService.getCanDirectRestore(pciDevice.uuid)
  }

  @ResolveField()
  async vfAvailableNum(@Parent() pciDevice: IPciDevice) {
    return this.pciDeviceQueryService.getVfAvailableNum(pciDevice.uuid)
  }

  @ResolveField(() => Int)
  async vmCount(@Parent() pciDevice: IPciDevice) {
    return await this.pciDeviceQueryService.getVMCount(pciDevice.uuid)
  }
}

@Resolver(() => PhysicalNic)
export class PhysicalNicResolver {
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject() hostDataloader: HostDataloader
  @Inject() zqlService: ZQLService
  @Inject()
  pciDeviceForPhysicalNicDataloader: PciDeviceForPhysicalNicDataloader
  @Inject() bondDataloader: BondDataloader
  @Inject() pciDeviceQueryService: PciDeviceQueryService
  @Inject() hostInterfaceService: HostInterfaceService
  @Inject() physicalNetworkService: PhysicalNetworkService

  @Query(() => PhysicalNicCountResp)
  async physicalNicCount(@Args('hostUuid') hostUuid: string) {
    const zql = ZQL.stringify({
      tableName: 'HostNetworkInterface',
      condition: {
        hostUuid
      },
      fields: 'carrierActive'
    })
    const {
      results: [{ inventories = [] }]
    } = await this.zqlService.call(zql)
    const up = inventories.filter(item => item.carrierActive)?.length ?? 0
    const down = inventories.filter(item => !item.carrierActive)?.length ?? 0

    return {
      up,
      down
    }
  }

  @Query(() => PhysicalNicLLDPDevice, { nullable: true })
  async physicalNicLLDPDevice(@Args() queryArgs: QueryPhysicalNicLLDPDeviceArgs) {
    return this.pciDeviceQueryService.getLLDPDeviceInfo(queryArgs)
  }

  @ResolveField()
  async lLDPMode(@Parent() physical: PhysicalNic) {
    return await this.pciDeviceQueryService.getLLDPMode(physical.uuid)
  }

  @ResolveField()
  async host(@Parent() physical: PhysicalNic) {
    return this.hostDataloader.query(physical.uuid, physical.hostUuid)
  }

  @ResolveField()
  async pciDevice(@Parent() physical: PhysicalNic) {
    return this.pciDeviceForPhysicalNicDataloader.query(physical.uuid)
  }

  @ResolveField()
  async bond(@Parent() physical: PhysicalNic) {
    return this.bondDataloader.query(physical.bondingUuid)
  }

  @ResolveField()
  async state(@Parent() physical: PhysicalNic) {
    // this.physicalMetricDataLoader.setOption({
    //   key: 'HostUuid',
    //   type: 'mutiple',
    //   value: physical.hostUuid
    // })
    // const metircData = await this.physicalMetricDataLoader.query(
    //   physical.uuid,
    //   metric =>
    //     metric.labels?.HostUuid === physical.hostUuid &&
    //     metric.labels?.InterfaceName === physical.interfaceName
    // )
    // let state = NicState.UP
    // switch (metircData?.value) {
    //   case 1: {
    //     state = NicState.UP
    //     break
    //   }
    //   default: {
    //     state = NicState.DOWN
    //   }
    // }
    // 后端将 carrierActive 状态改为可以直接判断的up、down，无需再从监控获取。
    return physical.carrierActive ? NicState.UP : NicState.DOWN
  }

  @ResolveField()
  async name(@Parent() physicalNic: PhysicalNic) {
    return physicalNic.interfaceName
  }

  @ResolveField(() => [HostNetworkInterfaceServiceRef])
  hostNetworkInterfaceServiceRef(@Parent() physicalNic: PhysicalNic) {
    return this.hostInterfaceService.hostNetworkInterfaceServiceRef(physicalNic.uuid)
  }

  @ResolveField(() => Boolean)
  availableVlanIds(@Parent() physicalNic: PhysicalNic) {
    return this.physicalNetworkService.availableVlanIds(physicalNic.uuid)
  }

  @ResolveField(() => L2Network)
  vSwitch(@Parent() physicalNic: PhysicalNic) {
    return this.pciDeviceQueryService.queryVSwitch(physicalNic.uuid, physicalNic.bondingUuid)
  }
}
