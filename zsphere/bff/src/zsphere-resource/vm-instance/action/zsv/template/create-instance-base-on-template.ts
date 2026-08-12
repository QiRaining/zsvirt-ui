import { Inject } from '@nestjs/common'
import { Args, Field, Float, InputType, Int, Mutation } from '@nestjs/graphql'
import * as _ from 'lodash'

import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import { AttachUsbDeviceToVmAction } from '@/api/zstack/AttachUsbDeviceToVmAction'
import {
  CreateVmInstanceFromTemplatedVmInstanceAction,
  CreateVmInstanceFromTemplatedVmInstanceActionParam,
  CreateVmInstanceFromTemplatedVmInstanceResult
} from '@/api/zstack/CreateVmInstanceFromTemplatedVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ImagePlatform, VmCreationStrategy } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { VGpuType } from '@/hardware-resource/vgpu-device/vgpu-device.model'
import { DomainMode, VmSpecPlatform } from '@/zsphere-resource/vm-spec/vm-spec.model'

import { SetVmEmulatorPinService } from '../../set-emulator-pin'
import { VGpuDeviceInVmCreate } from '../create-instance'
import {
  DiskAO,
  ZSVCdrom,
  ZSVCpuBindListByVCpuItem,
  ZSVNicConfig,
  ZSVUSBConfig
} from '../create-instance'

@InputType()
export class VmCustomSpecificationParam {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => VmSpecPlatform, { nullable: true })
  platform?: VmSpecPlatform

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => String, { nullable: true })
  rootPassword?: string

  @Field(() => Boolean, { nullable: true })
  generateSID?: boolean

  @Field(() => DomainMode, { nullable: true })
  domainMode?: DomainMode

  @Field(() => String, { nullable: true })
  domainName?: string

  @Field(() => String, { nullable: true })
  domainUsername?: string

  @Field(() => String, { nullable: true })
  domainPassword?: string

  @Field(() => String, { nullable: true })
  organization?: string
}

@InputType()
class CreateVMFromTemplatePayload {
  @Field(() => String)
  templatedVmInstanceUuid: string

  @Field(() => String)
  name: string

  @Field(() => Int)
  count: number

  @Field(() => String, { nullable: true })
  guestOsType?: string

  // 系统架构
  @Field(() => String, { nullable: true })
  architecture?: string

  @Field(() => Boolean, { nullable: true })
  virtio: boolean

  // 镜像platform
  @Field(() => ImagePlatform, { nullable: true })
  platform?: ImagePlatform

  //默认启动
  @Field(() => VmCreationStrategy, { nullable: true })
  strategy?: VmCreationStrategy

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => [DiskAO], { nullable: true })
  diskAOs?: DiskAO[]

  @Field(() => [ZSVUSBConfig], { nullable: true })
  vmUSBConfig?: ZSVUSBConfig[]

  @Field(() => String, { nullable: true })
  defaultL3NetworkUuid?: string

  @Field(() => [String], { nullable: true })
  l3NetworkUuids: string[]

  //vmNicParams 对象数据字符串，zsv新增
  @Field(() => String, { nullable: true })
  vmNicParams?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => [String], { defaultValue: [] })
  tagUuids?: string[]

  // VGpu设备
  @Field(() => VGpuDeviceInVmCreate, { nullable: true })
  vgpuDevice?: VGpuDeviceInVmCreate

  // Gpu设备
  @Field(() => [String], { defaultValue: [] })
  gpuDeviceUuidList?: string[]

  // pcie
  @Field(() => [String], { defaultValue: [] })
  pcieDeviceList?: string[]

  // usb重定向
  @Field(() => Boolean, { nullable: true })
  usbRedirect?: boolean
  // cpu模式
  @Field(() => String, { nullable: true })
  cpuMode?: string

  // cpu配额
  @Field(() => Float, { nullable: true })
  cpuQuota?: number
  // cpu热插拔
  @Field(() => Boolean, { nullable: true })
  hotPlug?: boolean

  // 核数
  @Field(() => Int, { nullable: true })
  sockedNum?: number

  // cpu隐藏kvm标记
  @Field(() => String, { nullable: true })
  cpuHideKVMMark?: string

  // cpu优先级
  @Field(() => String, { nullable: true })
  cpuResourceLevel?: string

  // CPU绑定类型
  @Field(() => String, { defaultValue: 'none' })
  cpuBindType: string

  // CPU按numa结构绑定类型
  @Field(() => [ZSVCpuBindListByVCpuItem], { defaultValue: [] })
  cpuBindListByVCpu: ZSVCpuBindListByVCpuItem[]

  @Field(() => Boolean, { nullable: true })
  vnumaEnabled: boolean

  // 高可用
  @Field(() => String, { nullable: true })
  ha?: string

  @Field(() => String, { nullable: true })
  bootMode?: string

  //集群
  @Field(() => String, { nullable: true })
  clusterUuid?: string

  //物理机
  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { defaultValue: 'default' })
  group: string

  // 云主机调度组
  @Field(() => String, { nullable: true })
  vmGroupUuid?: string

  // 虚拟光驱
  @Field(() => [ZSVCdrom], { defaultValue: [] })
  cdromList: ZSVCdrom[]

  //总显存
  @Field(() => Float, { nullable: true })
  totalGPUMemory?: number

  // memory优先级
  @Field(() => String, { nullable: true })
  memoryResourceLevel?: string

  @Field(() => String, { nullable: true })
  gpuType?: string

  @Field(() => String, { nullable: true })
  soundCard?: string

  @Field(() => String, { nullable: true })
  motherboardType?: string

  @Field(() => [ZSVNicConfig], { nullable: true })
  vmNicConfig?: ZSVNicConfig[]

  @Field(() => String, { nullable: true })
  emulatorPinning?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => VmCustomSpecificationParam, { nullable: true })
  vmCustomSpecification?: VmCustomSpecificationParam

  @Field(() => Boolean, { nullable: true })
  resetTpm?: boolean
}

@InputType()
class CreateVMFromTemplateInput {
  @Field(() => CreateVMFromTemplatePayload)
  payload: CreateVMFromTemplatePayload

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

export class CreateVmFromVMTemplateService extends ActionService {
  @Inject()
  createVmInstanceFromTemplatedVmInstanceAction: CreateVmInstanceFromTemplatedVmInstanceAction

  @Inject() setVmEmulatorPinService: SetVmEmulatorPinService
  @Inject() private attachTagToResourcesAction: AttachTagToResourcesAction

  //加载usb
  @Inject() attachUsbDeviceToVmAction: AttachUsbDeviceToVmAction

  @Mutation(() => ActionResult)
  createVMFromTemplate(@Args('input') input: CreateVMFromTemplateInput) {
    const actionId = input.action.actionId
    // this.vmActionHelper(input, 'VmTemplate',)

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: CreateVMFromTemplatePayload, taskId: string) => {
        //获取参数
        const { createVmParams, attachEipToVmParam, tagParamList, vmPayload } =
          this.buildParams(payload)

        const createVMResp: CreateVmInstanceFromTemplatedVmInstanceResult =
          await this.createVmInstanceFromTemplatedVmInstanceAction.call(createVmParams, {
            taskId,
            actionId
          })

        //    const vm = createVMResp?.result?.inventories?.[0]?.inventory
        const vmUuids = createVMResp?.result?.inventories?.map(item => item?.inventory?.uuid) ?? []

        //加载标签
        await Promise.all(
          tagParamList?.map(tagParam => {
            return this.attachTagToResourcesAction.call(
              {
                resourceUuids: [..._.compact(vmUuids)],
                tagUuid: tagParam.tagUuid
              },
              { taskId, actionId }
            )
          })
        )

        //走高级配置
        const configTasks = []

        if (vmPayload?.emulatorPinning) {
          configTasks.push(
            vmUuids.map(vm => {
              return this.setVmEmulatorPinService.actionFn(
                {
                  uuid: vm?.uuid,
                  emulatorPinning: vmPayload.emulatorPinning
                },
                taskId,
                actionId
              )
            })
          )
        }

        await Promise.all(configTasks)

        //走Usb
        const usbTasks = []

        if (vmPayload?.vmUSBConfig) {
          usbTasks.push(
            vmUuids.map(uuid =>
              vmPayload?.vmUSBConfig?.map(usb => {
                return this.attachUsbDeviceToVmAction.call(
                  {
                    vmInstanceUuid: uuid,
                    usbDeviceUuid: usb?.usbDeviceUuid,
                    attachType: usb?.attachType
                  },
                  { taskId, actionId }
                )
              })
            )
          )
        }

        await Promise.all(_.flattenDeep(usbTasks))

        return {
          id: payload.templatedVmInstanceUuid,
          inventory: createVMResp
        }
      }
    )
    return { actionId }
  }

  //systemTags 细节部分
  getVmBaseSystemTag(param: CreateVMFromTemplatePayload) {
    let systemTags = []

    if (param.hostname) {
      systemTags.push(`hostname::${param.hostname}`)
    }

    if (param.sockedNum && param.sockedNum !== 0) {
      systemTags.push(`cpuCores::${param.sockedNum}`)
    }
    if (param.cpuQuota) {
      systemTags.push(`resourceConfig::kvm::vm.cpu.quota::${param.cpuQuota * 10000}`)
    }

    if (param.group && param.group !== '-2' && param.group !== '-1') {
      systemTags.push(`directoryUuid::${param.group}`)
    }
    if (param.ha && param.ha !== 'None') {
      systemTags.push('ha::NeverStop')
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

    // if (param.affinityGroupUuid)
    //   systemTags.push(`affinityGroupUuid::${param.affinityGroupUuid}`)

    if (param?.vmGroupUuid) {
      systemTags.push(`vmSchedulingRuleGroupUuid::${param.vmGroupUuid}`)
    }

    //     if (!param.sshkey) {
    //       if (param.userData) {
    //         let userData = param.userData
    //         if (param.rootPassword !== '' && !!param.rootPassword) {
    //           if (_.includes(['Windows', 'WindowsVirtio'], param?.platform)) {
    //             userData =
    //               userData +
    //               `<script>net user ${param.rootUsername} ${param.rootPassword}<\/script>`
    //           } else {
    //             userData =
    //               userData +
    //               `
    //   chpasswd:
    //     list: |
    //         ${param.rootUsername}:${param.rootPassword}
    //     expire: False`
    //           }
    //         }
    //         systemTags.push(`userdata::${Utf8Base64.encode(userData)}`)
    //       } else if (param.rootPassword && param.rootPassword) {
    //         let userData = ''
    //         if (_.includes(['Windows', 'WindowsVirtio'], param?.platform)) {
    //           userData = `<script>net user ${param.rootUsername} ${param.rootPassword}<\/script>`
    //         } else {
    //           userData = `
    //             #cloud-config
    //             chpasswd:
    //               list: |
    //                   ${param.rootUsername}:${param.rootPassword}
    //               expire: False`
    //         }
    //         systemTags.push(`userdata::${Utf8Base64.encode(userData)}`)
    //       }
    //     } else {
    //       if (param.userData)
    //         systemTags.push(`userdata::${Utf8Base64.encode(param.userData)}`)
    //     }

    //     if (param.dataPrimaryStorageUuid)
    //       systemTags.push(
    //         `primaryStorageUuidForDataVolume::${param.dataPrimaryStorageUuid}`
    //       )

    if (param.hotPlug) {
      systemTags.push(`resourceConfig::vm::numa::true`)
    } else {
      systemTags.push(`resourceConfig::vm::numa::false`)
    }
    // if (param.vmCpuHypervisorFeature)
    //   systemTags.push(
    //     `resourceConfig::vm::kvmHiddenState::${param.vmCpuHypervisorFeature}`
    //   )

    // if (param?.spiceStreamingMode) {
    //   systemTags.push(
    //     `resourceConfig::vm::spiceStreamingMode::${param?.spiceStreamingMode}`
    //   )
    // }
    // if (param?.faultStrategy) {
    //   systemTags.push(
    //     `resourceConfig::vm::crash.strategy::${param?.faultStrategy}`
    //   )
    // }
    // if (param?.advancedConfigGuestToolTimeSync) {
    //   systemTags.push(`resourceConfig::vm::vm.clock.track::host`)
    // }

    // if (param.emulateHyperV)
    //   systemTags.push(
    //     `resourceConfig::vm::emulateHyperV::${param.emulateHyperV}`
    //   )
    if (param.gpuType) {
      systemTags.push(`resourceConfig::vm::videoType::${param.gpuType}`)
    }
    if (param.soundCard) {
      systemTags.push(`resourceConfig::vm::soundType::${param.soundCard}`)
    }
    if (param.motherboardType === 'q35') {
      systemTags.push(`vmMachineType::q35`)
    }
    // if (param.vmPortOff)
    //   systemTags.push(`resourceConfig::vm::vmPortOff::${param.vmPortOff}`)
    // if (param.bootMenuSplashTimeout)
    //   systemTags.push(
    //     `resourceConfig::vm::bootMenuSplashTimeout::${param.bootMenuSplashTimeout}`
    //   )

    if (param?.cpuMode) {
      systemTags.push(`resourceConfig::kvm::vm.cpuMode::${param?.cpuMode}`)
    }

    if (param?.cpuHideKVMMark) {
      //这个tag有问题，"API call[org.zstack.header.message.APIEvent] failed because [code: SYS.1000, description: An internal error happened in system, details: None]"
      // systemTags.push(
      //   `resourceConfig::kvm::vm.cpu.hypervisor.feature::${param?.cpuHideKVMMark}`
      // )
    }

    // if (param?.migrateAutoConverge) {
    //   systemTags.push(
    //     `resourceConfig::kvm::migrate.autoConverge::${param?.migrateAutoConverge}`
    //   )
    // }

    // if (param?.hotPlugEnabled) {
    //   systemTags.push(
    //     `resourceConfig::pciDevice::hotPlugEnabled::${param?.hotPlugEnabled}`
    //   )
    // }

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
      let str = param.cdromList.reduce((total, cur) => {
        total += `::${cur.isoUuid || 'Empty'}`
        return total
      }, 'cdroms')
      str += '::None'.repeat(3 - param.cdromList.length)
      systemTags.push(str)
    } else {
      systemTags.push('createWithoutCdRom::true')
    }

    if (param.usbRedirect) {
      systemTags.push(`usbRedirect::${param.usbRedirect}`)
    }

    //绑定物理CPU
    const buildCpuBindString = (cpuBindList: ZSVCpuBindListByVCpuItem[]): string => {
      return cpuBindList.reduce((acc, { vCPU = '', pCPUList = [] }) => {
        const pCPUs = pCPUList.filter(pCPU => !pCPU.includes('NUMA node')).join(',')
        return vCPU && pCPUs ? `${acc}${vCPU}:${pCPUs};` : acc
      }, '')
    }

    const isCpuBindStructure = param.cpuBindType === 'structure'
    const hasCpuBindList = param.cpuBindListByVCpu.length > 0

    if (isCpuBindStructure && hasCpuBindList) {
      const cpuBindStr = buildCpuBindString(param.cpuBindListByVCpu)
      systemTags.push(`vmCpuPinning::${cpuBindStr || 'false'}`)
      systemTags.push('vmNumaEnable::true')
    } else {
      //模版没有numa属性不设置就好,不需要传入false
      // systemTags.push('vmNumaEnable::false')
      // systemTags.push('vmCpuPinning::;')
    }

    if (param.bootMode) {
      systemTags.push(`bootMode::${param.bootMode}`)
    }
    // if (param.consoleMode) {
    //   systemTags.push(`vmConsoleMode::${param.consoleMode}`)
    // }
    // if (param.antiSpoofing)
    //   systemTags.push(`cleanTraffic::${param.antiSpoofing}`)
    return systemTags
  }

  buildParams(actionParam: CreateVMFromTemplatePayload): {
    createVmParams: CreateVmInstanceFromTemplatedVmInstanceActionParam
    attachEipToVmParam: AttachEipActionTaskParam[]
    tagParamList: AttachTagToVmInstanceServiceParam[]
    vmPayload: CreateVMFromTemplatePayload
  } {
    const createVmParams = []
    const count: number = actionParam.count || 1

    // 处理参数
    const param: CreateVmInstanceFromTemplatedVmInstanceActionParam = {
      names: [...Array(count).keys()].map(i =>
        i === 0 && count === 1 ? actionParam.name : `${actionParam.name}-${i + 1}`
      ),
      description: actionParam.description,
      cpuNum: actionParam.cpuNum,
      memorySize: actionParam.memorySize,
      strategy: actionParam.strategy,
      templatedVmInstanceUuid: actionParam.templatedVmInstanceUuid,
      vmNicParams: actionParam.vmNicParams
    }

    if (actionParam?.zoneUuid) {
      param.zoneUuid = actionParam.zoneUuid
    }

    if (actionParam?.hostUuid) {
      param.hostUuid = actionParam.hostUuid
    }

    if (actionParam?.clusterUuid) {
      param.clusterUuid = actionParam.clusterUuid
    }

    if (actionParam?.vmCustomSpecification) {
      param.vmCustomSpecification = actionParam.vmCustomSpecification
    }

    if (actionParam?.resetTpm != null) {
      param.resetTpm = actionParam.resetTpm
    }

    // 处理系统标签
    const systemTags: string[] = this.getVmBaseSystemTag(actionParam)
    if (systemTags.length > 0) {
      param.systemTags = systemTags
    }

    // 网卡部分
    const l3NetworkUuids: string[] = []

    actionParam?.vmNicConfig?.forEach((vmNic, i) => {
      // noipam 指定ip等参数
      if (vmNic.systemTags) {
        systemTags.push(...vmNic.systemTags)
      }
      l3NetworkUuids.push(vmNic.l3NetworkUuid)
      if (vmNic.customMac) {
        systemTags.push(`customMac::${vmNic.l3NetworkUuid}::${vmNic.customMac}`)
      }

      if (vmNic.staticIp) {
        systemTags.push(
          `staticIp::${vmNic.l3NetworkUuid}::${_.replace(vmNic.staticIp, '::', '--')}`
        )
      }

      if (vmNic.staticIpv6) {
        systemTags.push(
          `staticIp::${vmNic.l3NetworkUuid}::${_.replace(vmNic.staticIpv6, '::', '--')}`
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
        systemTags.push(`l3::${l3NetworkUuid}::SecurityGroupUuids::${securityGroupList.join(',')}`)
      }
    })

    if (actionParam?.defaultL3NetworkUuid) {
      param.defaultL3NetworkUuid = actionParam.defaultL3NetworkUuid
    }

    if (actionParam?.l3NetworkUuids?.length > 0) {
      param.l3NetworkUuids = actionParam.l3NetworkUuids
    }

    if (actionParam.diskAOs?.length > 0) {
      // 2024/4/30 创建时硬盘的逻辑 ，不允许卸载，仅允许新增，diskaos只传入新增的盘

      // 硬盘部分
      // const rootDiskAos = {
      //   boot: true,
      //   platform: actionParam.platform,
      //   guestOsType: actionParam.guestOsType,
      //   architecture: actionParam.architecture,
      //   systemTags: actionParam.virtio ? [`driver::virtio`] : []
      // }

      param.diskAOs = actionParam.diskAOs.map((item, index) => ({
        ...item,
        boot: index === 0
      }))
      //.concat([rootDiskAos])
    }

    // createVmParams.push(param)

    // build 绑定eip/安全组 param
    const attachEipToVmParam: AttachEipActionTaskParam[] = []

    // 处理标签
    const tagParamList = actionParam?.tagUuids?.map(tagUuid => {
      return { tagUuid }
    })

    return {
      createVmParams: param,
      attachEipToVmParam,
      tagParamList,
      vmPayload: actionParam
    }
  }
}
