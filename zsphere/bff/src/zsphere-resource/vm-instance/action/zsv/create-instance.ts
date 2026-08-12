import { Inject } from '@nestjs/common'
import { Args, Field, Float, InputType, Int, Mutation, PickType } from '@nestjs/graphql'
import * as _ from 'lodash'
import { cloneDeep as _cloneDeep } from 'lodash'

import { AttachEipAction } from '@/api/zstack/AttachEipAction'
import { AttachScsiLunToVmInstanceAction } from '@/api/zstack/AttachScsiLunToVmInstanceAction'
import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import {
  AttachUsbDeviceToVmAction,
  AttachUsbDeviceToVmResult
} from '@/api/zstack/AttachUsbDeviceToVmAction'
import {
  CreateVmInstanceAction,
  CreateVmInstanceResult as ICreateVmInstanceResult
} from '@/api/zstack/CreateVmInstanceAction'
import { SetVmClockTrackAction } from '@/api/zstack/SetVmClockTrackAction'
import { SetVmMonitorNumberAction } from '@/api/zstack/SetVmMonitorNumberAction'
import { SetVmNumaAction } from '@/api/zstack/SetVmNumaAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ImagePlatform, VmCreationStrategy, VolumeProvisioningStrategy } from '@/common/enum'
import {
  ActionInput,
  ActionResult,
  ActionTaskResult,
  ActionTaskState
} from '@/common/model/action.model'
import { VGpuDevice, VGpuType } from '@/hardware-resource/vgpu-device/vgpu-device.model'
import { UpdateResourceConfigPayload } from '@/settings/resource-config/action/update-resource-config'
import { genUuid, intToIp, ipToInt } from '@/utils'
import Utf8Base64 from '@/utils/utf8Base64'

import {
  RemoveHaStickStragedyPayload,
  RemoveHaStickStragedyService
} from '../remove-hastickstragedy'
import { SetVmEmulatorPinPayload, SetVmEmulatorPinService } from '../set-emulator-pin'
import { SetHaStickStragedyPayload, SetHaStickStragedyService } from '../set-hastickstragedy'
import { SetVmCleanTrafficPayload, SetVmCleanTrafficService } from '../set-vm-anti-spoofing'
import { SetVmBootOrderService } from '../set-vm-bootorder'

@InputType()
export class VGpuDeviceInVmCreate extends PickType(VGpuDevice, ['uuid', 'type'], InputType) {}

@InputType()
export class ZSVNicConfig {
  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  staticIp?: string

  @Field(() => String, { nullable: true })
  ipv4Gateway?: string

  @Field(() => String, { nullable: true })
  ipv4Netmask?: string

  @Field(() => String, { nullable: true })
  staticIpv6?: string

  @Field(() => Int, { nullable: true })
  ipv6Prefix?: number

  @Field(() => String, { nullable: true })
  ipv6Gateway?: string

  @Field({ nullable: true })
  customMac?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => [String], { defaultValue: [] })
  securityGroupList?: string[]

  @Field(() => [String], { defaultValue: [] })
  eipList?: string[]

  @Field(() => Boolean, { defaultValue: false })
  enableSRIOV: boolean

  @Field(() => String, { defaultValue: '0' })
  nicMultiQueueNum: string

  @Field(() => String, { defaultValue: '0' })
  inboundBandwidth: string

  @Field(() => String, { defaultValue: '0' })
  outboundBandwidth: string

  @Field(() => String, { defaultValue: '0' })
  driverType: string

  @Field(() => String, { defaultValue: '' })
  vfParentUuid?: string

  @Field(() => [String], { nullable: true })
  dnsList?: string[]

  @Field(() => [String], { nullable: true })
  dns6List?: string[]
}

@InputType()
export class DiskAO {
  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => Float, { nullable: true })
  size?: number

  @Field(() => String, { nullable: true })
  templateUuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  diskOfferingUuid?: string

  @Field(() => String, { nullable: true })
  diskOffering?: string

  @Field(() => String, { nullable: true })
  sourceType?: string

  @Field(() => String, { nullable: true })
  sourceUuid?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
export class ZSVUSBConfig {
  @Field(() => String)
  usbDeviceUuid: string

  @Field(() => String, { nullable: true })
  attachType?: string
}

@InputType()
export class ZSVCdrom {
  @Field(() => String)
  cdRom: string

  @Field(() => String, { nullable: true })
  isoUuid?: string
}

@InputType()
export class ZSVCpuBindListByVCpuItem {
  @Field(() => String)
  vCPU: string

  @Field(() => [String], { defaultValue: [] })
  pCPUList: string[]
}

@InputType()
export class TpmDeviceConfig {
  @Field(() => Boolean, { nullable: true, defaultValue: true })
  enable?: boolean

  @Field(() => String, { nullable: true })
  keyProviderUuid?: string
}

@InputType()
export class VmDevicesConfig {
  @Field(() => TpmDeviceConfig, { nullable: true })
  tpm?: TpmDeviceConfig
}

@InputType()
export class CreateInstancePayload {
  @Field(() => Int, { defaultValue: 1 })
  count?: number

  @Field(() => String)
  name: string

  @Field(() => String, { defaultValue: '' })
  description?: string

  @Field(() => String, { nullable: true })
  imageUuid?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  // 系统类别
  @Field(() => String, { nullable: true })
  guestOsType?: string

  // 系统架构
  @Field(() => String, { nullable: true })
  architecture?: string

  @Field(() => Boolean, { nullable: true })
  virtio: boolean

  // 镜像platform
  @Field(() => String, { nullable: true })
  platform?: ImagePlatform

  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => Int, { nullable: true })
  sockedNum?: number

  @Field(() => String, { nullable: true })
  cpuMode?: string

  @Field(() => Float, { nullable: true })
  cpuQuota?: number

  @Field(() => String, { nullable: true })
  cpuHideKVMMark?: string

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => Float, { nullable: true })
  rootDiskSize?: number

  @Field(() => [String], { nullable: true })
  rootVolumeSystemTags?: string[]

  @Field(() => [Float], { nullable: true })
  dataDiskSizes?: number[]

  @Field(() => [String], { nullable: true })
  dataVolumeTemplateUuids?: string[]

  @Field(() => Float, { nullable: true })
  networkOutboundBandwidth?: number

  @Field(() => Float, { nullable: true })
  networkInboundBandwidth?: number

  @Field(() => Boolean, { nullable: true })
  virtioSCSI?: boolean

  // 通过规格创建云主机

  @Field(() => String, { nullable: true })
  instanceOfferingUuid?: string

  @Field(() => String)
  defaultL3NetworkUuid: string

  @Field(() => String, { nullable: true })
  group?: string

  @Field(() => [String], { defaultValue: [] })
  tagUuids?: string[]

  @Field(() => [ZSVNicConfig], { nullable: true })
  vmNicConfig?: ZSVNicConfig[]

  @Field(() => String, { nullable: true })
  rootDiskOfferingUuid?: string

  @Field(() => String, { nullable: true })
  dataVolumeSystemTagsOnIndex?: string

  @Field(() => [DiskAO], { nullable: true })
  DiskAOs?: DiskAO[]

  @Field(() => VmDevicesConfig, { nullable: true })
  devices?: VmDevicesConfig

  @Field(() => [ZSVUSBConfig], { nullable: true })
  vmUSBConfig?: ZSVUSBConfig[]

  // ssh公钥
  @Field(() => String, { nullable: true })
  sshkey?: string

  // 高可用
  @Field(() => String, { nullable: true })
  ha?: string
  // 高可用
  @Field(() => String, { nullable: true })
  gpuType?: string
  //总显存
  @Field(() => Float, { nullable: true })
  totalGPUMemory?: number
  // 高可用
  @Field(() => String, { nullable: true })
  soundCard?: string

  // 主板
  @Field(() => String, { nullable: true })
  motherboardType?: string

  // cpu优先级
  @Field(() => String, { nullable: true })
  cpuResourceLevel?: string

  // cpu优先级
  @Field(() => Boolean, { nullable: true })
  hotPlug?: boolean

  // memory优先级
  @Field(() => String, { nullable: true })
  memoryResourceLevel?: string

  // 亲和组, 4.6.0 弃用亲和组， 加了云主机调度组
  @Field(() => String, { nullable: true })
  affinityGroupUuid?: string

  // 云主机调度组
  @Field(() => String, { nullable: true })
  vmGroupUuid?: string

  @Field(() => String, { nullable: true })
  userData?: string

  // 用户名
  @Field(() => String, { nullable: true })
  rootUsername?: string

  // 密码
  @Field(() => String, { nullable: true })
  rootPassword?: string

  // 根云盘指定主存储
  @Field(() => String, { nullable: true })
  rootPrimaryStorageUuid?: string

  // 数据云盘指定主存储
  @Field(() => String, { nullable: true })
  dataPrimaryStorageUuid?: string

  // Gpu规格 || VGpu规格
  //   @Field(() => GpuDeviceSpecInVmCreate, { nullable: true })
  //   gpuDeviceSpec?: GpuDeviceSpecInVmCreate

  // VGpu设备
  @Field(() => VGpuDeviceInVmCreate, { nullable: true })
  vgpuDevice?: VGpuDeviceInVmCreate

  // Gpu设备
  @Field(() => [String], { defaultValue: [] })
  gpuDeviceUuidList?: string[]

  // Gpu设备
  @Field(() => Boolean, { defaultValue: false })
  se?: boolean

  // pcie
  @Field(() => [String], { defaultValue: [] })
  pcieDeviceList?: string[]

  // BIOS时间同步
  @Field(() => Boolean, { defaultValue: false })
  biosTimeSync?: boolean

  // 是否自动释放GPU设备
  @Field(() => Boolean, { nullable: true })
  autoReleaseGpuDevice?: boolean

  // 虚拟光驱
  @Field(() => [ZSVCdrom], { defaultValue: [] })
  cdromList: ZSVCdrom[]

  // 数据云盘规格
  @Field(() => [String], { nullable: true })
  dataDiskOfferingUuids?: string[]

  // CPU绑定类型
  @Field(() => String, { defaultValue: 'none' })
  cpuBindType: string

  // CPU按numa结构绑定类型
  @Field(() => [ZSVCpuBindListByVCpuItem], { defaultValue: [] })
  cpuBindListByVCpu: ZSVCpuBindListByVCpuItem[]

  @Field(() => Boolean, { nullable: true })
  vnumaEnabled?: boolean

  //   // CPU绑定
  //   @Field(() => [VtoPCPUBind], { defaultValue: [] })
  //   vtoPCPUBindList: VtoPCPUBind[]

  // 数据云盘主存储策略
  @Field(() => VolumeProvisioningStrategy, { nullable: true })
  thinProvisionForDataPrimaryStorage?: VolumeProvisioningStrategy

  // 云盘主存储策略
  @Field(() => VolumeProvisioningStrategy, { nullable: true })
  thinProvisionForPrimaryStorage?: VolumeProvisioningStrategy

  // 根云盘主存储策略
  @Field(() => VolumeProvisioningStrategy, { nullable: true })
  thinProvisionForRootPrimaryStorage?: VolumeProvisioningStrategy

  // 根云盘池 || Ceph存储池
  @Field(() => String, { nullable: true })
  rootPoolName?: string

  // 数据云盘池 || Ceph存储池
  @Field(() => String, { nullable: true })
  dataPoolName?: string

  //vmNicParams 对象数据字符串，zsv新增
  @Field(() => String, { nullable: true })
  vmNicParams?: string

  //disk 相关直接参数--------------------start
  //总线类型
  @Field(() => String, { nullable: true })
  busType?: string

  //分配方式
  @Field(() => String, { nullable: true })
  allocationType?: string

  //分配方式
  @Field(() => String, { nullable: true })
  cacheMode?: string

  @Field(() => Float, { nullable: true })
  diskBandWidth?: number

  @Field(() => Float, { nullable: true })
  diskIops?: number

  @Field(() => Boolean, { nullable: true })
  diskSharable?: boolean

  @Field(() => Boolean, { nullable: true })
  aio?: boolean

  //disk 相关直接参数--------------------end

  // 防欺诈模式
  @Field(() => Boolean, { nullable: true })
  antiSpoofing?: boolean

  //主机名
  @Field(() => String, { nullable: true })
  hostname?: string

  //集群
  @Field(() => String, { nullable: true })
  clusterUuid?: string

  //物理机
  @Field(() => String, { nullable: true })
  hostUuid?: string

  //时间同步
  @Field(() => String, { nullable: true })
  clockTrack?: string

  //默认启动
  @Field(() => VmCreationStrategy, { nullable: true })
  strategy?: VmCreationStrategy

  @Field(() => [String], { nullable: true })
  l3NetworkUuids: string[]

  //高级设置

  //高级设置-性能优化工具部分
  @Field(() => String, { nullable: true })
  faultStrategy?: string

  @Field(() => Boolean, { nullable: true })
  advancedConfigGuestToolTimeSync?: boolean

  //高级设置-远程访问部分
  // 控制台模式
  @Field(() => String, { nullable: true })
  consoleMode?: string

  @Field(() => Int, { nullable: true })
  vdiMonitorNumber?: number
  // // antiSpoofing: { number: 4, unit: "MB" },

  // Spice Streaming
  @Field(() => String, { nullable: true })
  spiceStreamingMode?: string

  // 控制台密码
  @Field(() => String, { nullable: true })
  consolePassword?: string

  // usb重定向
  @Field(() => Boolean, { nullable: true })
  usbRedirect?: boolean

  //引导选项：
  @Field(() => [String], { nullable: true })
  bootOrders?: string[]

  @Field(() => String, { nullable: true })
  bootMode?: string

  @Field(() => String, { nullable: true })
  bootMenuSplashTimeout?: string

  @Field(() => Boolean, { nullable: true })
  secureBoot?: boolean

  //其他选项
  @Field(() => String, { nullable: true })
  vmCpuHypervisorFeature?: string

  @Field(() => String, { nullable: true })
  vmPortOff?: string

  @Field(() => String, { nullable: true })
  haStickStragedy?: string

  @Field(() => String, { nullable: true })
  emulatorPinning?: string

  @Field(() => String, { nullable: true })
  emulateHyperV?: string

  @Field(() => String, { nullable: true })
  migrateAutoConverge?: string

  @Field(() => String, { nullable: true })
  hotPlugEnabled?: string

  //网络防欺诈
  @Field(() => SetVmCleanTrafficPayload, { nullable: true })
  setVmCleanTrafficPayload?: SetVmCleanTrafficPayload

  @Field(() => SetHaStickStragedyPayload, { nullable: true })
  setHaStickStragedyPayload?: SetHaStickStragedyPayload

  @Field(() => RemoveHaStickStragedyPayload, { nullable: true })
  removeHaStickStragedyPayload?: RemoveHaStickStragedyPayload

  // spice Streming
  @Field(() => [UpdateResourceConfigPayload], { nullable: true })
  updateResourceConfigPayload?: UpdateResourceConfigPayload[]

  @Field(() => SetVmEmulatorPinPayload, { nullable: true })
  setVmEmulatorPinPayload?: SetVmEmulatorPinPayload

  @Field(() => String, { nullable: true })
  vmCpuIdVendor?: string
}

@InputType()
class CreateInstanceInput {
  @Field(() => CreateInstancePayload)
  payload: CreateInstancePayload

  @Field(() => ActionInput)
  action: ActionInput
}

interface AttachEipActionTaskParam {
  eipUuid: string
  l3networkUuid: string
}

interface AttachTagToVmInstanceServiceParam {
  tagUuid: string
}

export class CreateInstanceService extends ActionService {
  @Inject() private createVmInstanceAction: CreateVmInstanceAction
  @Inject() private attachEipAction: AttachEipAction
  @Inject() private attachTagToResourcesAction: AttachTagToResourcesAction
  @Inject() setVmCleanTrafficService: SetVmCleanTrafficService
  @Inject() setHaStickStragedyService: SetHaStickStragedyService
  @Inject() setVmEmulatorPinService: SetVmEmulatorPinService

  @Inject() setVmNumaAction: SetVmNumaAction
  @Inject() attachScsiLunToVmInstanceAction: AttachScsiLunToVmInstanceAction

  //加载usb
  @Inject() attachUsbDeviceToVmAction: AttachUsbDeviceToVmAction

  @Inject() setVmClockTrackAction: SetVmClockTrackAction

  //高级设置-远程访问部分
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction
  @Inject() setVmMonitorNumberAction: SetVmMonitorNumberAction

  //高级设置-引导选项部分
  @Inject() setVmBootOrderService: SetVmBootOrderService

  //高级设置-其他配置部分
  @Inject() removeHaStickStragedyService: RemoveHaStickStragedyService

  @Mutation(() => ActionResult)
  createInstance(
    @Args('input')
    input: CreateInstanceInput
  ) {
    const actionId = input.action.actionId

    this.vmActionHelper(input, 'VmInstance')

    return { actionId }
  }

  async create(
    vmParam: CreateInstanceActionParam,
    attachEipToVmParam: AttachEipActionTaskParam[],
    tagParamList: AttachTagToVmInstanceServiceParam[],
    vmPayload: CreateInstancePayload,
    info
  ) {
    const vmResp: ICreateVmInstanceResult = await this.createVmInstanceAction.call(
      vmParam,
      _cloneDeep(info)
    )
    const vm = vmResp?.inventory
    // 挂载Eip
    await Promise.all(
      attachEipToVmParam?.map(attachL3ToVmParam => {
        const vmNic = vmResp?.inventory?.vmNics?.find(
          vmNic => vmNic.l3NetworkUuid === attachL3ToVmParam.l3networkUuid
        )
        return this.attachEipAction.call(
          {
            vmNicUuid: vmNic?.uuid,
            eipUuid: attachL3ToVmParam.eipUuid
          },
          _cloneDeep(info)
        )
      })
    )
    //加载标签
    await Promise.all(
      tagParamList?.map(tagParam => {
        return this.attachTagToResourcesAction.call(
          {
            resourceUuids: [vm?.uuid],
            tagUuid: tagParam.tagUuid
          },
          _cloneDeep(info)
        )
      })
    )

    // await Promise.all(
    //   vmPayload?.vmUSBConfig?.map(usb => {
    //     return this.attachUsbDeviceToVmAction.call(
    //       {
    //         vmInstanceUuid: vm?.uuid,
    //         usbDeviceUuid: usb?.usbDeviceUuid,
    //         attachType: usb?.attachType
    //       },
    //       _cloneDeep(info)
    //     )
    //   })
    // )

    const configTasks = []
    //走配置的task在这里做，要拿到vmuuid再改：
    if (vmPayload?.vdiMonitorNumber) {
      configTasks.push(
        this.setVmMonitorNumberAction.call(
          {
            uuid: vm?.uuid,
            monitorNumber: vmPayload.vdiMonitorNumber
          },
          _cloneDeep(info)
        )
      )
    }

    //引导选项-bootOrders
    if (vmPayload?.bootOrders && vmPayload?.bootOrders?.length !== 0) {
      configTasks.push(
        this.setVmBootOrderService.actionFn(
          {
            uuid: vm?.uuid,
            bootOrder: vmPayload?.bootOrders?.filter(it => it !== 'Empty'),
            systemTags: []
          },
          _cloneDeep(info).taskId,
          _cloneDeep(info).actionId
        )
      )
    }

    if (vmPayload?.vnumaEnabled) {
      configTasks.push(
        this.setVmNumaAction.call(
          {
            uuid: vm?.uuid,
            enable: vmPayload.vnumaEnabled
          },
          _cloneDeep(info)
        )
      )
    }

    if (vmPayload?.emulatorPinning) {
      configTasks.push(
        this.setVmEmulatorPinService.actionFn(
          {
            uuid: vm?.uuid,
            emulatorPinning: vmPayload.emulatorPinning
          },
          _cloneDeep(info).taskId,
          _cloneDeep(info).actionId
        )
      )
    }

    await Promise.all(configTasks)

    const subActionResults: {
      attachUsbDeviceToVmAction: PromiseSettledResult<AttachUsbDeviceToVmResult>[]
    } = { attachUsbDeviceToVmAction: [] }

    if (vmPayload?.vmUSBConfig && vmPayload?.vmUSBConfig?.length !== 0 && vmPayload.count === 1) {
      // 加载 USB
      const usbResults = await Promise.allSettled(
        vmPayload?.vmUSBConfig?.map(usb => {
          return this.attachUsbDeviceToVmAction.call(
            {
              vmInstanceUuid: vm?.uuid,
              usbDeviceUuid: usb?.usbDeviceUuid,
              attachType: usb?.attachType
            },
            _cloneDeep(info)
          )
        })
      )
      subActionResults.attachUsbDeviceToVmAction.push(...usbResults)
    }

    return subActionResults
  }

  buildVmParams(actionParam: CreateInstancePayload): {
    vmParams: CreateInstanceActionParam[]
    attachEipToVmParam: AttachEipActionTaskParam[]
    tagParamList: AttachTagToVmInstanceServiceParam[]
    vmPayload: CreateInstancePayload
  } {
    const vmParams = []
    const configs = []

    const count: number = actionParam.count || 1

    for (let i = 0; i < count; i++) {
      const l3NetworkUuids: string[] = []
      const systemTags: string[] = this.getVmBaseSystemTag(actionParam)
      actionParam?.vmNicConfig?.forEach(vmNic => {
        // noipam 指定ip等参数
        if (vmNic.systemTags) {
          systemTags.push(...vmNic.systemTags)
        }
        l3NetworkUuids.push(vmNic.l3NetworkUuid)
        if (vmNic.customMac) {
          systemTags.push(
            `customMac::${vmNic.l3NetworkUuid}::${this.getMacAfterAddIndex(vmNic.customMac, i)}`
          )
        }

        if (vmNic.staticIp) {
          systemTags.push(
            `staticIp::${vmNic.l3NetworkUuid}::${_.replace(
              this.getIpAfterAddIndex(vmNic.staticIp, i),
              '::',
              '--'
            )}`
          )
        }

        if (vmNic.staticIpv6) {
          systemTags.push(
            `staticIp::${vmNic.l3NetworkUuid}::${_.replace(
              this.getIpAfterAddIndex(vmNic.staticIpv6, i),
              '::',
              '--'
            )}`
          )
        }

        if (vmNic.ipv4Netmask) {
          systemTags.push(
            `ipv4Netmask::${vmNic.l3NetworkUuid}::${_.replace(vmNic.ipv4Netmask, '::', '--')}`
          )
        }

        if (vmNic.ipv6Prefix) {
          systemTags.push(`ipv6Prefix::${vmNic.l3NetworkUuid}::${vmNic.ipv6Prefix}`)
        }

        if (vmNic.ipv4Gateway) {
          systemTags.push(
            `ipv4Gateway::${vmNic.l3NetworkUuid}::${_.replace(vmNic.ipv4Gateway, '::', '--')}`
          )
        }

        if (vmNic.ipv6Gateway) {
          systemTags.push(
            `ipv6Gateway::${vmNic.l3NetworkUuid}::${_.replace(vmNic.ipv6Gateway, '::', '--')}`
          )
        }

        //nicMultiQueueNum todo
        // if (vmNic.nicMultiQueueNum)
        //   systemTags.push(`enableSRIOV::${vmNic.l3NetworkUuid}`)
        if (vmNic?.securityGroupList?.length > 0) {
          const { l3NetworkUuid, securityGroupList } = vmNic
          systemTags.push(
            `l3::${l3NetworkUuid}::SecurityGroupUuids::${securityGroupList.join(',')}`
          )
        }
      })
      const param: any = {
        name: i === 0 && count === 1 ? actionParam.name : `${actionParam.name}-${i + 1}`,
        description: actionParam.description,
        rootDiskSize: actionParam.rootDiskSize,
        cpuNum: actionParam.cpuNum,
        memorySize: actionParam.memorySize,
        systemTags: systemTags,
        rootVolumeSystemTags: actionParam.rootVolumeSystemTags,
        dataVolumeSystemTags: [],
        virtio: actionParam.virtio,
        strategy: actionParam.strategy

        // virtio: actionParam.virtio //
      }

      if (actionParam?.devices?.tpm) {
        param.devices = actionParam.devices
      }

      const rootDiskAos = {
        boot: true,
        platform: actionParam.platform,
        guestOsType: actionParam.guestOsType,
        architecture: actionParam.architecture,
        systemTags: actionParam.virtio ? [`driver::virtio`] : []
      }

      param.diskAOs = (
        actionParam?.DiskAOs?.map(item => {
          const diskAO: any = { ...item, boot: false }
          if (diskAO.name && count > 1) {
            // 将 VM 索引插入到字母后缀前面
            // Data-for-vm → Data-for-vm-1
            // Data-for-vm-a → Data-for-vm-1-a
            const letterMatch = diskAO.name.match(/(-[a-z])$/)
            if (letterMatch) {
              diskAO.name = diskAO.name.slice(0, -2) + `-${i + 1}${letterMatch[1]}`
            } else {
              diskAO.name = `${diskAO.name}-${i + 1}`
            }
          }
          return diskAO
        }) ?? []
      ).concat([rootDiskAos])

      if (actionParam?.zoneUuid) {
        param.zoneUuid = actionParam.zoneUuid
      }

      if (actionParam?.l3NetworkUuids?.length > 0) {
        param.l3NetworkUuids = actionParam.l3NetworkUuids
      }

      if (actionParam?.vmNicConfig?.length > 0) {
        param.defaultL3NetworkUuid = actionParam.defaultL3NetworkUuid
      }

      if (actionParam?.imageUuid !== '') {
        param.imageUuid = actionParam?.imageUuid
      }
      if (actionParam.rootPrimaryStorageUuid !== '') {
        param.primaryStorageUuidForRootVolume = actionParam.rootPrimaryStorageUuid
      }
      if (actionParam.clusterUuid !== '') {
        param.clusterUuid = actionParam.clusterUuid
      }
      if (actionParam.hostUuid !== '') {
        param.hostUuid = actionParam.hostUuid
      }

      if (actionParam.vmNicParams) {
        param.vmNicParams = actionParam.vmNicParams
      }
      if (actionParam.thinProvisionForDataPrimaryStorage) {
        param.dataVolumeSystemTags.push(
          `volumeProvisioningStrategy::${actionParam.thinProvisionForDataPrimaryStorage}`
        )
      }
      if (actionParam.dataPoolName) {
        param.dataVolumeSystemTags.push(`ceph::pool::${actionParam.dataPoolName}`)
      }
      if (actionParam.busType) {
        param.dataVolumeSystemTags.push(`capability::${actionParam.busType}`)
      }
      if (actionParam.hostname) {
        param.systemTags.push(
          `hostname::${
            i === 0 && count === 1 ? actionParam.hostname : `${actionParam.hostname}-${i + 1}`
          }`
        )
      }
      if (actionParam.dataDiskSizes) {
        param.dataDiskSizes = actionParam.dataDiskSizes
      }
      if (actionParam?.dataVolumeSystemTagsOnIndex) {
        const dataVolumeSystemTagsOnIndexArray = JSON.parse(
          actionParam?.dataVolumeSystemTagsOnIndex
        )

        const result = {}

        dataVolumeSystemTagsOnIndexArray.forEach((t, index) => {
          result[index] = dataVolumeSystemTagsOnIndexArray[index]
        })
        param.dataVolumeSystemTagsOnIndex = result
      }
      if (actionParam.haStickStragedy === 'false' && actionParam.clusterUuid) {
        param.systemTags.push(`resourceBindings::Cluster:${actionParam.clusterUuid}`)
      }

      vmParams.push(param)
    }

    // // build 绑定eip/安全组 param
    const attachEipToVmParam: AttachEipActionTaskParam[] = []
    // actionParam.vmNicConfig.forEach(vmNic => {
    //   if (vmNic.eipList?.length > 0)
    //     attachEipToVmParam = attachEipToVmParam.concat(
    //       vmNic.eipList?.map(eipUuid => {
    //         return { l3networkUuid: vmNic.l3NetworkUuid, eipUuid }
    //       })
    //     )
    // })

    const tagParamList = actionParam?.tagUuids?.map(tagUuid => {
      return { tagUuid }
    })

    return {
      vmParams,
      attachEipToVmParam,
      tagParamList,
      vmPayload: actionParam
    }
  }

  getVmBaseSystemTag(param: CreateInstancePayload) {
    let systemTags = []

    if (param.sockedNum && param.sockedNum !== 0) {
      systemTags.push(`cpuCores::${param.sockedNum}`)
    }

    if (param.biosTimeSync) {
      systemTags.push(`resourceConfig::vm::vm.clock.track::guest`)
    }

    if (param.cpuQuota) {
      systemTags.push(`resourceConfig::kvm::vm.cpu.quota::${param.cpuQuota * 10000}`)
    }

    if (param.group && param.group !== '-2' && param.group !== '-1') {
      systemTags.push(`directoryUuid::${param.group}`)
    }
    if (param.clockTrack) {
      systemTags.push(`resourceConfig::vm::vm.clock.track::${param.clockTrack}`)
    }
    if (param.se) {
      systemTags.push(`securityElementEnable::true`)
    }
    if (param.consolePassword) {
      systemTags.push(`consolePassword::${param.consolePassword}`)
    }
    if (param.sshkey) {
      systemTags.push(`sshkey::${param.sshkey}`)
    }

    if (param.ha === 'NeverStop') {
      systemTags.push('ha::NeverStop')
    } else if (param.ha === 'None') {
      systemTags.push('ha::None')
    }

    if (param.totalGPUMemory) {
      systemTags.push(`qxlMemory::0::${param.totalGPUMemory}::0`)
    }

    if (param.cpuResourceLevel === 'Normal' && param.memoryResourceLevel === 'Normal') {
      systemTags.push(`vmPriority::Normal`)
    }
    if (param.cpuResourceLevel === 'Normal' && param.memoryResourceLevel === 'High') {
      systemTags.push(`vmPriority::MemoryHigh`)
    }
    if (param.cpuResourceLevel === 'CpuHigh' && param.memoryResourceLevel === 'Normal') {
      systemTags.push(`vmPriority::CpuHigh`)
    }
    if (param.cpuResourceLevel === 'CpuHigh' && param.memoryResourceLevel === 'High') {
      systemTags.push(`vmPriority::High`)
    }

    if (param.affinityGroupUuid) {
      systemTags.push(`affinityGroupUuid::${param.affinityGroupUuid}`)
    }

    if (param?.vmGroupUuid) {
      systemTags.push(`vmSchedulingRuleGroupUuid::${param.vmGroupUuid}`)
    }

    if (!param.sshkey) {
      if (param.userData) {
        let userData = param.userData
        if (param.rootPassword !== '' && !!param.rootPassword) {
          if (_.includes(['Windows', 'WindowsVirtio'], param?.platform)) {
            userData =
              userData + `<script>net user ${param.rootUsername} ${param.rootPassword}</script>`
          } else {
            userData =
              userData +
              `
  chpasswd:
    list: |
        ${param.rootUsername}:${param.rootPassword}
    expire: False`
          }
        }
        systemTags.push(`userdata::${Utf8Base64.encode(userData)}`)
      } else if (param.rootPassword && param.rootPassword) {
        let userData = ''
        if (_.includes(['Windows', 'WindowsVirtio'], param?.platform)) {
          userData = `<script>net user ${param.rootUsername} ${param.rootPassword}</script>`
        } else {
          userData = `
            #cloud-config
            chpasswd:
              list: |
                  ${param.rootUsername}:${param.rootPassword}
              expire: False`
        }
        systemTags.push(`userdata::${Utf8Base64.encode(userData)}`)
      }
    } else {
      if (param.userData) {
        systemTags.push(`userdata::${Utf8Base64.encode(param.userData)}`)
      }
    }

    if (param.dataPrimaryStorageUuid) {
      systemTags.push(`primaryStorageUuidForDataVolume::${param.dataPrimaryStorageUuid}`)
    }

    if (param.hotPlug) {
      systemTags.push(`resourceConfig::vm::numa::${param.hotPlug}`)
    }
    if (param.vmCpuHypervisorFeature) {
      systemTags.push(`resourceConfig::vm::kvmHiddenState::${param.vmCpuHypervisorFeature}`)
    }

    if (param?.spiceStreamingMode) {
      systemTags.push(`resourceConfig::vm::spiceStreamingMode::${param?.spiceStreamingMode}`)
    }
    if (param?.faultStrategy) {
      systemTags.push(`resourceConfig::vm::crash.strategy::${param?.faultStrategy}`)
    }
    if (param?.advancedConfigGuestToolTimeSync) {
      systemTags.push(`resourceConfig::vm::vm.clock.track::host`)
    }

    if (param.emulateHyperV) {
      systemTags.push(`resourceConfig::vm::emulateHyperV::${param.emulateHyperV}`)
    }
    if (param.gpuType) {
      systemTags.push(`resourceConfig::vm::videoType::${param.gpuType}`)
    }
    if (param.soundCard) {
      systemTags.push(`resourceConfig::vm::soundType::${param.soundCard}`)
    }
    if (param.motherboardType === 'q35') {
      systemTags.push(`vmMachineType::q35`)
    }
    if (param.vmPortOff) {
      systemTags.push(`resourceConfig::vm::vmPortOff::${param.vmPortOff}`)
    }
    if (param.bootMenuSplashTimeout) {
      systemTags.push(`resourceConfig::vm::bootMenuSplashTimeout::${param.bootMenuSplashTimeout}`)
    }

    // Secure Boot：创建时通过 ResourceConfig 形式的 systemTag 下发
    if (param.secureBoot !== undefined) {
      systemTags.push(`resourceConfig::vm::enable.uefi.secure.boot::${param.secureBoot}`)
    }

    if (param?.cpuMode) {
      systemTags.push(`resourceConfig::kvm::vm.cpuMode::${param?.cpuMode}`)
    }

    if (param?.cpuHideKVMMark) {
      systemTags.push(`resourceConfig::kvm::vm.cpu.hypervisor.feature::${param?.cpuHideKVMMark}`)
    }

    if (param?.migrateAutoConverge) {
      systemTags.push(`resourceConfig::kvm::migrate.autoConverge::${param?.migrateAutoConverge}`)
    }

    if (param?.hotPlugEnabled) {
      systemTags.push(`resourceConfig::pciDevice::hotPlugEnabled::${param?.hotPlugEnabled}`)
    }

    if (param?.vmCpuIdVendor) {
      systemTags.push(`resourceConfig::vm::vm.cpuid.vendor::${param.vmCpuIdVendor}`)
    }

    if (param.count === 1) {
      if (param.vgpuDevice) {
        systemTags.push(
          `${
            param.vgpuDevice.type === VGpuType.MdevDevice ? 'mdevDevice' : 'pciDevice'
          }::${param.vgpuDevice.uuid}`
        )
      } else if (param.gpuDeviceUuidList) {
        systemTags = systemTags.concat(param.gpuDeviceUuidList?.map(uuid => `pciDevice::${uuid}`))
      }

      if (param.pcieDeviceList) {
        systemTags = systemTags.concat(param.pcieDeviceList?.map(uuid => `pciDevice::${uuid}`))
      }
    }

    if (param.cdromList.length !== 0) {
      const data = param.cdromList

      const items = Array.isArray(data) ? data.slice(0, 3) : []

      // 处理每个元素
      const formattedItems = items.map(item => {
        if (item.isoUuid) {
          return item.isoUuid
        } else if (item.cdRom) {
          return 'Empty'
        } else {
          return 'None'
        }
      })

      // 如果数组长度不足3，用'None'填充
      while (formattedItems.length < 3) {
        formattedItems.push('None')
      }

      // 组合成最终的字符串
      const str = 'cdroms::' + formattedItems.join('::')

      systemTags.push(str)
    } else {
      systemTags.push('createWithoutCdRom::true')
    }

    if (param.usbRedirect) {
      systemTags.push(`usbRedirect::${param.usbRedirect}`)
    }

    //绑定物理CPU
    if (param.cpuBindType === 'structure' && param.cpuBindListByVCpu.length > 0) {
      let cpuBindStr = ''
      const fromatArr =
        param.cpuBindListByVCpu?.map(item => {
          return {
            vCPU: item.vCPU ?? '',
            pCPU: item?.pCPUList?.filter(item => !item.includes('NUMA node')).join(',') ?? ''
          }
        }) ?? []
      fromatArr?.map(item => {
        if (item.vCPU !== '' && item.pCPU !== '') {
          cpuBindStr += `${item.vCPU}:${item.pCPU};`
        }
      })
      if (cpuBindStr === '') {
        cpuBindStr = 'false'
      } else {
        systemTags.push(`vmCpuPinning::${cpuBindStr}`)
        systemTags.push('vmNumaEnable::true')
      }
    }

    if (param.bootMode) {
      systemTags.push(`bootMode::${param.bootMode}`)
    }
    if (param.consoleMode) {
      systemTags.push(`vmConsoleMode::${param.consoleMode}`)
    }
    if (param.antiSpoofing) {
      systemTags.push(`cleanTraffic::${param.antiSpoofing}`)
    }
    return systemTags
  }

  getMultiCreateVmSystemTags({ index, input }: { index: number; input: CreateInstancePayload }) {
    const systemTags = []
    if (input.hostname !== '' && !!input.hostname) {
      if (index === 1) {
        systemTags.push(`hostname::${input.hostname}`)
      } else {
        systemTags.push(`hostname::${input.hostname}${index}`)
      }
    }
    return systemTags
  }

  getIpAfterAddIndex(ip: string, index: number): string {
    const isIpv6: boolean = ip.indexOf(':') > -1
    if (isIpv6) {
      const eachByteOfIp: string[] = ip.split(':')
      eachByteOfIp[eachByteOfIp.length - 1] = (
        parseInt(eachByteOfIp[eachByteOfIp.length - 1], 16) + index
      ).toString(16)
      const tmpIp: string = eachByteOfIp.join(':')
      return tmpIp
    } else {
      return intToIp(ipToInt(ip) + index)
    }
  }

  getMacAfterAddIndex(macAddress: string, index: number): string {
    const eachByteOfMac: string[] = macAddress.split(':')
    eachByteOfMac[eachByteOfMac.length - 1] = (
      parseInt(eachByteOfMac[eachByteOfMac.length - 1], 16) + index
    ).toString(16)
    const tmpMac: string = eachByteOfMac.map(it => (it.length === 1 ? `0${it}` : it)).join(':')
    return tmpMac
  }

  async vmActionHelper(input: CreateInstanceInput, resourceType: string) {
    const { payload, action } = input
    const { actionId, name: actionName } = action

    const total = payload.count ?? 1
    let successCount = 0
    let exceptionCount = 0

    await this.recordActionService.recordActionStart(payload, actionId, actionName)

    //获取参数
    const { vmParams, attachEipToVmParam, tagParamList, vmPayload } = this.buildVmParams(payload)

    const createWidth = 50
    const vmParamsChunk = _.chunk(vmParams, Math.ceil(vmParams.length / createWidth))
    try {
      await Promise.all(
        vmParamsChunk.map(async vmParams => {
          for (let i = 0; i < vmParams.length; i++) {
            const vmParam = vmParams[i]
            const taskId = genUuid()
            await this.recordActionService.recordTaskStart(taskId, actionId)
            let payload: ActionTaskResult
            try {
              const subActionResults = await this.create(
                vmParam,
                attachEipToVmParam,
                tagParamList,
                vmPayload,
                {
                  actionId,
                  taskId
                }
              )
              if (
                subActionResults.attachUsbDeviceToVmAction.some(result => {
                  return result.status === 'rejected'
                })
              ) {
                await this.recordActionService.recordTaskException(taskId)
                payload = {
                  sessionId: this.getSessionId(),
                  actionId,
                  state: ActionTaskState.exception,
                  type: resourceType,
                  listenerType: 'createInstance',
                  id: taskId
                }
                exceptionCount += 1
              } else {
                await this.recordActionService.recordTaskSuccess(taskId)
                payload = {
                  sessionId: this.getSessionId(),
                  actionId,
                  state: ActionTaskState.success,
                  type: resourceType,
                  listenerType: 'createInstance',
                  id: taskId
                }
                successCount++
              }
            } catch (error) {
              await this.recordActionService.recordTaskFailed(taskId)
              payload = {
                state: ActionTaskState.fail,
                sessionId: this.getSessionId(),
                actionId: actionId,
                type: resourceType,
                listenerType: 'createInstance',
                error: JSON.stringify(error)
              }
            }
            this.pubSubService.response(payload)
          }
        })
      )
      // 收集数据写入数据库
      if (successCount === total) {
        await this.recordActionService.recordActionSuccess(actionId)
      } else if ((successCount > 0 && successCount < total) || exceptionCount === total) {
        await this.recordActionService.recordActionException(actionId)
      } else {
        await this.recordActionService.recordActionFailed(actionId)
      }
    } catch (error) {
      // 如果 Promise 中间出错统一认为是错误
      await this.recordActionService.recordActionFailed(actionId)
    }
  }
}

export interface CreateInstanceActionParam {
  name: string
  description?: string
  imageUuid: string
  instanceOfferingUuid: string
  vmNicConfig?: ZSVNicConfig[]
  ZSVUSBConfig?: ZSVUSBConfig[]
  defaultL3NetworkUuid: string
  l3NetworkUuids: string[]
  count: number
  systemTags?: string[]
  tagUuids?: string[]
}
