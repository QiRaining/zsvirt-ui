import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, registerEnumType, Int, Float } from '@nestjs/graphql'
import * as _ from 'lodash'

import { AttachDataVolumeToVmAction } from '@/api/zstack/AttachDataVolumeToVmAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { CreateDataVolumeAction } from '@/api/zstack/CreateDataVolumeAction'
import { CreateDataVolumeFromVolumeTemplateAction } from '@/api/zstack/CreateDataVolumeFromVolumeTemplateAction'
import { DeleteResourceConfigAction } from '@/api/zstack/DeleteResourceConfigAction'
import { DetachL3NetworkFromVmAction } from '@/api/zstack/DetachL3NetworkFromVmAction'
import { RebootVmInstanceAction } from '@/api/zstack/RebootVmInstanceAction'
import { SetVmBootVolumeAction } from '@/api/zstack/SetVmBootVolumeAction'
import { SetVmQxlMemoryAction } from '@/api/zstack/SetVmQxlMemoryAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { SetSystemTagPayload, SetSystemTagService } from '@/common/system-tag/set-system-tag'
import {
  AttachPciDeviceToVmService,
  AttachPciDeviceToVMPayload
} from '@/hardware-resource/pci-device/action/attach-to-vm'
import {
  DetachPciDeviceFromVMService,
  DetachPciDeviceFromVMPayload
} from '@/hardware-resource/pci-device/action/detach-from-vm'
import {
  AttachScsiLunToVmInstancePayload,
  AttachScsiLunToVmInstanceService
} from '@/hardware-resource/scsi-lun/action/attach-scsi-lun-to-vm-instance'
import {
  DetachScsiLunFromVmInstancePayload,
  DetachScsiLunFromVmInstanceService
} from '@/hardware-resource/scsi-lun/action/detach-scsi-lun-from-vm-instance'
import { AddTpmToVmService, AddTpmToVmPayload } from '@/hardware-resource/tpm/action/add-tpm-to-vm'
import {
  RemoveTpmFromVmService,
  RemoveTpmFromVmPayload
} from '@/hardware-resource/tpm/action/remove-tpm-from-vm'
import { UpdateTpmService, UpdateTpmPayload } from '@/hardware-resource/tpm/action/update-tpm'
import {
  AttachUsbDeviceToVmService,
  AttachUsbDeviceToVmPayload
} from '@/hardware-resource/usb-device/action/attach-usb'
import {
  DetachUsbDeviceToVmService,
  DetachUsbDeviceToVmPayload
} from '@/hardware-resource/usb-device/action/detach-usb'
import {
  AttachVGpuToVmInstanceService,
  AttachVGpuToVmInstancePayload
} from '@/hardware-resource/vgpu-device/action/attach-to-vm'
import {
  DetachVGpuFromVmInstancePayload,
  DetachVGpuFromVmInstanceService
} from '@/hardware-resource/vgpu-device/action/detach-from-vm'
import {
  CreateVmCdRomPayload,
  CreateVmCdRomService
} from '@/zsphere-resource/cdroms/action/create-cdrom'
import { DeleteCdRomPayload, DeleteCdRomService } from '@/zsphere-resource/cdroms/action/delete'
import {
  AddResourcesToDirectoryPayload,
  AddResourcesToDirectoryService
} from '@/zsphere-resource/vm-directory-group/action/add-resources-to-directory'
import {
  SetVmNicSecurityGroupPayload,
  SetVmNicSecurityGroupService
} from '@/zsphere-resource/vm-nic/action/set-security-group'
import {
  DeleteDataVolumePayload,
  DeleteDataVolumeService
} from '@/zsphere-resource/volume/action/delete-data-volume'

//网卡相关操作
import { AttachL3NetworkToVmNicService } from '../../vm-nic/action/attach-l3-network'
import {
  VmNicBindSecurityGroupPayload,
  VmNicBindSecurityGroupService
} from '../../vm-nic/action/bind-security-gourp'
import {
  DeleteVmStaticIpPayload,
  DeleteVmStaticIpService
} from '../../vm-nic/action/delete-static-ip'
import {
  UpdateVmNicDriverService,
  UpdateVmNicDriverPayload
} from '../../vm-nic/action/set-drive-type'
import {
  ChangeVmNicNetworkPayload,
  ChangeVmNicNetworkService
} from '../../vm-nic/action/set-ip-address'
import { SetNicQosPayload, SetNicQosService } from '../../vm-nic/action/set-qos'
import { ChangeVmNicStatePayload, ChangeVmNicStateService } from '../../vm-nic/action/set-state'
import { SetVmStaticIpPayload, SetVmStaticIpService } from '../../vm-nic/action/set-static-ip'
import {
  UpdateVmNetworkConfigService,
  UpdateVmNetworkConfigPayload
} from '../../vm-nic/action/sync-network-config'
import {
  VmNicUnBindSecurityGroupPayload,
  VmNicUnBindSecurityGroupService
} from '../../vm-nic/action/unbind-security-group'
import { UpdateVmNicMacPayload, UpdateVmNicMacService } from '../../vm-nic/action/update-mac'
import {
  DeleteVolumeQosPayload,
  DeleteVolumeQosService
} from '../../volume/action/delete-volume-qos'
//云盘相关操作
import {
  ResizeDataVolumePayload,
  ResizeDataVolumeService
} from '../../volume/action/resize-data-volume'
import { SetVolumeQosPayload, SetVolumeQosService } from '../../volume/action/set-volume-qos'
import {
  AttachDataVolumeToVmService,
  AttachDataVolumeToVmPayload
} from './attach-data-volume-to-vm'
import {
  AttachIsoToVmInstanceService,
  AttachIsoToVmInstancePayload
} from './attach-iso-to-vm-instance'
import { ChangeVmImagePayload, ChangeVmImageService } from './change-vm-image'
import { ChangeVmPasswordPayload, ChangeVmPasswordService } from './change-vm-password'
import {
  DeleteVmConsolePasswordPayload,
  DeleteVmConsolePasswordService
} from './delete-console-password'
import {
  DetachDataVolumeFromVmService,
  DetachDataVolumeFromVmPayload
} from './detach-data-volume-from-vm'
import {
  DetachGuestToolsIsoFromVmService,
  DetachGuestToolsIsoFromVmPayload
} from './detach-guest-tools-iso-from-vm'
import {
  DetachIsoFromVmInstanceService,
  DetachIsoFromVmInstancePayload
} from './detach-iso-from-vm-instance'
import {
  RemoveHaStickStragedyPayload,
  RemoveHaStickStragedyService
} from './remove-hastickstragedy'
import { ResizeRootVolumeService, ResizeRootVolumePayload } from './resize-root-volume'
import { SetVmConsoleModePayload, SetVmConsoleModeService } from './set-consle-mode'
import { SetVmConsolePasswordPayload, SetVmConsolePasswordService } from './set-console-password'
import { SetGpuDeviceSpecPayload, SetVmInstanceGpuDeviceSpecService } from './set-gpu-offering'
import { SetHaStickStragedyPayload, SetHaStickStragedyService } from './set-hastickstragedy'
import { SetVmClockTrackService, SetVmClockTrackPayload } from './set-time-sync'
import { SetVmUsbRedirectPayload, SetVmUsbRedirectService } from './set-usb-redirect'
import { SetVmBootVolumePayload } from './set-vm-boot-volume'
import { SetVmBootOrderPayload, SetVmBootOrderService } from './set-vm-bootorder'
import { SetVmDnsPayload, SetVmDnsService } from './set-vm-dns'
import { SetVmHaLevelPayload, SetVmHaLevelService } from './set-vm-ha'
import {
  StartVmInstanceFromHostService,
  StartVmInstanceFromHostPayload
} from './start-vm-from-host'
import { UpdateVmInstanceService, UpdateVmInstancePayload } from './update-vm-instance'
import { UpdateVmPriorityPayload, UpdateVmPriorityService } from './update-vm-priority'

enum EditVmInstanceActionType {
  Add,
  Delete,
  Update
}

registerEnumType(EditVmInstanceActionType, {
  name: 'EditVmInstanceActionType'
})

enum EditVmInstanceResouceType {
  VM,
  Volume,
  Nic,
  GpuDevice,
  GpuDeviceSpec,
  VGpuDevice,
  PciDevice,
  UsbDevice,
  ResourceConfig
}

registerEnumType(EditVmInstanceResouceType, {
  name: 'EditVmInstanceResouceType'
})

@InputType()
export class ResourceConfigPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  category: string

  @Field(() => String)
  resourceUuid: string

  @Field(() => String, { nullable: true })
  value?: string
}

@InputType()
export class SetVmQxlMemoryPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Int)
  vram: number
}

@InputType()
export class AttachL3NetworkToVmNicInEditVmPayload {
  @Field(() => String, { description: '当前网卡的uuid' })
  vmInstanceUuid: string

  @Field(() => String, { description: '三层网的uuid' })
  l3NetworkUuid: string

  @Field(() => String, { description: 'ip4', nullable: true })
  staticIpv4: string

  @Field(() => String, { description: 'ip6', nullable: true })
  staticIpv6?: string

  @Field(() => String, { description: '自定义网卡MAC地址', nullable: true })
  customMac: string

  @Field(() => Boolean, { nullable: true })
  enableSRIOV?: boolean

  @Field(() => [String], { nullable: true, defaultValue: [] })
  securityGroupUuids?: string[]

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => String, { nullable: true })
  driverType?: string

  @Field(() => Float, { description: '上行带宽', nullable: true })
  outboundBandwidth?: number

  @Field(() => Float, { description: '下行带宽', nullable: true })
  inboundBandwidth?: number

  @Field(() => Int, { description: '网卡队列数', nullable: true })
  multiQueueNum?: number

  @Field(() => String, { nullable: true })
  vmNicParams?: string
}

@InputType()
export class SetVmNicSecurityGroupInEditPayload extends SetVmNicSecurityGroupPayload {}

@InputType()
export class CreateDataVolumeInEditVmPayload {
  @Field(() => String)
  name: string

  @Field(() => Int)
  index: number

  @Field(() => Float, { nullable: true })
  diskSize?: number

  @Field(() => String, { nullable: true })
  imageUuid?: string

  @Field(() => [String], { nullable: true })
  vmInstanceUuids?: string[]

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => Int, { nullable: true })
  readBandwidth?: number

  @Field(() => Int, { nullable: true })
  writeBandwidth?: number

  @Field(() => Int, { nullable: true })
  totalBandwidth?: number

  @Field(() => Int, { nullable: true })
  readIOPS?: number

  @Field(() => Int, { nullable: true })
  writeIOPS?: number

  @Field(() => Int, { nullable: true })
  totalIOPS?: number

  @Field(() => String, { nullable: true })
  cacheMode?: string

  @Field(() => String, { nullable: true })
  aio?: string
}

@InputType()
class AttachScsiLunToVmInstancePayloadInEdit extends AttachScsiLunToVmInstancePayload {
  @Field(() => Int)
  index: number
}

@InputType()
class AttachDataVolumeToVmPayloadInEdit extends AttachDataVolumeToVmPayload {
  @Field(() => Int)
  index: number
}

@InputType()
class DetachL3NetworkFromVmInVmEditPayload {
  @Field(() => String)
  vmNicUuid: string
}

@InputType()
export class EditVmInstanceConfigPayload {
  @Field(() => String)
  resourceUuid: string

  @Field(() => Boolean, { nullable: true })
  neeeReboot?: boolean

  @Field(() => EditVmInstanceActionType, { nullable: true })
  actionType: EditVmInstanceActionType

  @Field(() => EditVmInstanceResouceType, { nullable: true })
  resourceType: EditVmInstanceResouceType

  @Field(() => UpdateVmInstancePayload, { nullable: true })
  updateVmInstancePayload?: UpdateVmInstancePayload

  @Field(() => SetVmHaLevelPayload, { nullable: true })
  setVmHaLevelPayload?: SetVmHaLevelPayload

  @Field(() => AddResourcesToDirectoryPayload, { nullable: true })
  addResourcesToDirectoryPayload?: AddResourcesToDirectoryPayload

  @Field(() => SetVmClockTrackPayload, { nullable: true })
  setVmClockTrackPayload?: SetVmClockTrackPayload

  @Field(() => [ResourceConfigPayload], { nullable: true })
  updateResourceConfigActionParams?: ResourceConfigPayload[]

  @Field(() => [ResourceConfigPayload], { nullable: true })
  updateCacheModeAndAioParams?: ResourceConfigPayload[]

  @Field(() => [UpdateVmPriorityPayload], { nullable: true })
  updateVmPriorityPayload?: UpdateVmPriorityPayload[]

  @Field(() => [DetachPciDeviceFromVMPayload], { nullable: true })
  detachPciDeviceFromVMPayloads?: DetachPciDeviceFromVMPayload[]

  @Field(() => [AttachPciDeviceToVMPayload], { nullable: true })
  attachPciDeviceToVMPayloads?: AttachPciDeviceToVMPayload[]

  @Field(() => [DetachVGpuFromVmInstancePayload], { nullable: true })
  detachVGpuFromVmInstancePayloads?: DetachVGpuFromVmInstancePayload[]

  @Field(() => [AttachVGpuToVmInstancePayload], { nullable: true })
  attachVGpuToVmInstancePayloads?: AttachVGpuToVmInstancePayload[]

  @Field(() => [AttachScsiLunToVmInstancePayloadInEdit], { nullable: true })
  attachScsiLunToVmInstancePayloads?: AttachScsiLunToVmInstancePayloadInEdit[]

  @Field(() => [DetachScsiLunFromVmInstancePayload], { nullable: true })
  detachScsiLunFromVmInstancePayloads?: DetachScsiLunFromVmInstancePayload[]

  @Field(() => SetGpuDeviceSpecPayload, { nullable: true })
  setGpuDeviceSpecPayload?: SetGpuDeviceSpecPayload

  @Field(() => SetVmUsbRedirectPayload, { nullable: true })
  setVmUsbRedirectPayload?: SetVmUsbRedirectPayload

  @Field(() => SetVmConsoleModePayload, { nullable: true })
  setVmConsoleModePayload?: SetVmConsoleModePayload

  @Field(() => [AttachDataVolumeToVmPayloadInEdit], { nullable: true })
  attachDataVolumeToVmPayload?: AttachDataVolumeToVmPayloadInEdit[]

  @Field(() => [DetachDataVolumeFromVmPayload], { nullable: true })
  detachDataVolumeFromVmPayload?: DetachDataVolumeFromVmPayload[]

  @Field(() => [DetachIsoFromVmInstancePayload], { nullable: true })
  detachIsoFromVmInstancePayload?: DetachIsoFromVmInstancePayload[]

  @Field(() => [AttachIsoToVmInstancePayload], { nullable: true })
  attachIsoToVmInstancePayload?: AttachIsoToVmInstancePayload[]

  @Field(() => [DetachGuestToolsIsoFromVmPayload], { nullable: true })
  detachGuestToolsIsoFromVmPayload?: DetachGuestToolsIsoFromVmPayload[]

  @Field(() => StartVmInstanceFromHostPayload, { nullable: true })
  startVmInstanceFromHostPayload?: StartVmInstanceFromHostPayload

  @Field(() => ChangeVmPasswordPayload, { nullable: true })
  changeVmPasswordPayload?: ChangeVmPasswordPayload

  @Field(() => ChangeVmImagePayload, { nullable: true })
  changeVmImagePayload: ChangeVmImagePayload

  @Field(() => SetVmConsolePasswordPayload, { nullable: true })
  setVmConsolePasswordPayload?: SetVmConsolePasswordPayload

  @Field(() => DeleteVmConsolePasswordPayload, { nullable: true })
  deleteVmConsolePasswordPayload?: DeleteVmConsolePasswordPayload

  @Field(() => SetVmBootOrderPayload, { nullable: true })
  setVmBootOrderPayload?: SetVmBootOrderPayload

  @Field(() => SetHaStickStragedyPayload, { nullable: true })
  setHaStickStragedyPayload?: SetHaStickStragedyPayload

  @Field(() => RemoveHaStickStragedyPayload, { nullable: true })
  removeHaStickStragedyPayload?: RemoveHaStickStragedyPayload

  @Field(() => [ResizeDataVolumePayload], { nullable: true })
  resizeDataVolumePayload?: ResizeDataVolumePayload[]

  @Field(() => [ResizeRootVolumePayload], { nullable: true })
  resizeRootVolumePayload?: ResizeRootVolumePayload[]

  @Field(() => [DeleteVolumeQosPayload], { nullable: true })
  deleteVolumeQosPayload?: DeleteVolumeQosPayload[]

  @Field(() => [SetVolumeQosPayload], { nullable: true })
  setVolumeQosPayload?: SetVolumeQosPayload[]

  @Field(() => [AttachL3NetworkToVmNicInEditVmPayload], { nullable: true })
  attachL3NetworkToVmNicInEditVmPayload?: AttachL3NetworkToVmNicInEditVmPayload[]

  @Field(() => [SetVmNicSecurityGroupInEditPayload], { nullable: true })
  setVmNicSecurityGroupInEditPayload?: SetVmNicSecurityGroupInEditPayload[]

  @Field(() => [DetachL3NetworkFromVmInVmEditPayload], { nullable: true })
  detachL3NetworkFromVmPayload?: DetachL3NetworkFromVmInVmEditPayload[]

  @Field(() => [SetVmStaticIpPayload], { nullable: true })
  setVmStaticIpPayload?: SetVmStaticIpPayload[]

  @Field(() => [ChangeVmNicNetworkPayload], { nullable: true })
  changeVmNicNetworkPayload?: ChangeVmNicNetworkPayload[]

  @Field(() => [DeleteVmStaticIpPayload], { nullable: true })
  deleteVmStaticIpPayload?: DeleteVmStaticIpPayload[]

  @Field(() => [SetVmDnsPayload], { nullable: true })
  setVmDnsPayload?: SetVmDnsPayload[]

  @Field(() => [SetNicQosPayload], { nullable: true })
  setNicQosPayload?: SetNicQosPayload[]

  @Field(() => [UpdateVmNicMacPayload], { nullable: true })
  updateVmNicMacPayload?: UpdateVmNicMacPayload[]

  @Field(() => [VmNicBindSecurityGroupPayload], { nullable: true })
  vmNicBindSecurityGroupPayload?: VmNicBindSecurityGroupPayload[]

  @Field(() => [VmNicUnBindSecurityGroupPayload], { nullable: true })
  vmNicUnBindSecurityGroupPayload?: VmNicUnBindSecurityGroupPayload[]

  @Field(() => [UpdateVmNicDriverPayload], { nullable: true })
  updateVmNicDriverPayload?: UpdateVmNicDriverPayload[]

  @Field(() => [ChangeVmNicStatePayload], { nullable: true })
  changeVmNicStatePayload?: ChangeVmNicStatePayload[]

  @Field(() => [SetSystemTagPayload], { nullable: true })
  setSystemTagPayload?: SetSystemTagPayload[]

  @Field(() => [CreateDataVolumeInEditVmPayload], { nullable: true })
  createDataVolumeInEditVmPayload?: CreateDataVolumeInEditVmPayload[]

  @Field(() => [DeleteDataVolumePayload], { nullable: true })
  deleteDataVolumePayload?: DeleteDataVolumePayload[]

  @Field(() => SetVmBootVolumePayload, { nullable: true })
  setVmBootVolumePayload?: SetVmBootVolumePayload

  @Field(() => [CreateVmCdRomPayload], { nullable: true })
  createVmCdRomPayload?: CreateVmCdRomPayload[]

  @Field(() => [DeleteCdRomPayload], { nullable: true })
  deleteCdRomPayload?: DeleteCdRomPayload[]

  @Field(() => [AttachUsbDeviceToVmPayload], { nullable: true })
  attachUsbDeviceToVmPayload?: AttachUsbDeviceToVmPayload[]

  @Field(() => [DetachUsbDeviceToVmPayload], { nullable: true })
  detachUsbDeviceToVmPayload?: DetachUsbDeviceToVmPayload[]

  @Field(() => SetVmQxlMemoryPayload, { nullable: true })
  setVmQxlMemoryPayload?: SetVmQxlMemoryPayload

  @Field(() => [UpdateVmNetworkConfigPayload], { nullable: true })
  updateVmNetworkConfigPayload?: UpdateVmNetworkConfigPayload[]

  @Field(() => AddTpmToVmPayload, { nullable: true })
  addTpmToVmPayload?: AddTpmToVmPayload

  @Field(() => RemoveTpmFromVmPayload, { nullable: true })
  removeTpmFromVmPayload?: RemoveTpmFromVmPayload

  @Field(() => UpdateTpmPayload, { nullable: true })
  updateTpmPayload?: UpdateTpmPayload
}

@InputType()
export class EditVmInstanceConfigInput {
  @Field(() => [EditVmInstanceConfigPayload])
  payload: EditVmInstanceConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditVmInstanceConfigService extends ActionService {
  @Inject() updateVmInstanceService: UpdateVmInstanceService
  @Inject() updateVmPriorityService: UpdateVmPriorityService
  @Inject() setVmHaLevelService: SetVmHaLevelService
  @Inject() setVmClockTrackService: SetVmClockTrackService
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction
  @Inject() deleteResourceConfigAction: DeleteResourceConfigAction
  @Inject() attachPciDeviceToVmService: AttachPciDeviceToVmService
  @Inject() detachPciDeviceFromVMService: DetachPciDeviceFromVMService
  @Inject()
  setVmInstanceGpuDeviceSpecService: SetVmInstanceGpuDeviceSpecService
  @Inject() attachVGpuToVmInstanceService: AttachVGpuToVmInstanceService
  @Inject() detachVGpuFromVmInstanceService: DetachVGpuFromVmInstanceService
  @Inject() setVmUsbRedirectService: SetVmUsbRedirectService
  @Inject() setVmConsoleModeService: SetVmConsoleModeService
  @Inject() attachDataVolumeToVmService: AttachDataVolumeToVmService
  @Inject() detachDataVolumeFromVmService: DetachDataVolumeFromVmService
  @Inject() detachIsoFromVmInstanceService: DetachIsoFromVmInstanceService
  @Inject() attachIsoToVmInstanceService: AttachIsoToVmInstanceService
  @Inject() detachGuestToolsIsoFromVmService: DetachGuestToolsIsoFromVmService
  @Inject() attachScsiLunToVmInstanceService: AttachScsiLunToVmInstanceService
  @Inject()
  detachScsiLunFromVmInstanceService: DetachScsiLunFromVmInstanceService

  @Inject() startVmInstanceFromHostService: StartVmInstanceFromHostService
  @Inject() changeVmPasswordService: ChangeVmPasswordService
  @Inject() setVmConsolePasswordService: SetVmConsolePasswordService
  @Inject() deleteVmConsolePasswordService: DeleteVmConsolePasswordService
  @Inject() setVmBootOrderService: SetVmBootOrderService
  @Inject() setHaStickStragedyService: SetHaStickStragedyService
  @Inject() removeHaStickStragedyService: RemoveHaStickStragedyService
  @Inject() resizeDataVolumeService: ResizeDataVolumeService
  @Inject() deleteVolumeQosService: DeleteVolumeQosService
  @Inject() setVolumeQosService: SetVolumeQosService
  @Inject() attachL3NetworkToVmNicService: AttachL3NetworkToVmNicService
  @Inject() detachL3NetworkFromVmAction: DetachL3NetworkFromVmAction
  @Inject() setVmStaticIpService: SetVmStaticIpService
  @Inject() setVmDnsService: SetVmDnsService
  @Inject() deleteVmStaticIpService: DeleteVmStaticIpService
  @Inject() setNicQosService: SetNicQosService
  @Inject() updateVmNicMacService: UpdateVmNicMacService
  @Inject() vmNicBindSecurityGroupService: VmNicBindSecurityGroupService
  @Inject() vmNicUnBindSecurityGroupService: VmNicUnBindSecurityGroupService
  @Inject() updateVmNicDriverService: UpdateVmNicDriverService
  @Inject() changeVmNicStateService: ChangeVmNicStateService
  @Inject() setSystemTagService: SetSystemTagService
  @Inject() attachDataVolumeToVmAction: AttachDataVolumeToVmAction
  @Inject() createDataVolumeAction: CreateDataVolumeAction
  @Inject()
  createDataVolumeFromVolumeTemplateAction: CreateDataVolumeFromVolumeTemplateAction
  @Inject() deleteDataVolumeService: DeleteDataVolumeService
  @Inject() resizeRootVolumeService: ResizeRootVolumeService
  @Inject() createVmCdRomService: CreateVmCdRomService
  @Inject() deleteCdRomService: DeleteCdRomService
  @Inject() changeVmNicNetworkService: ChangeVmNicNetworkService
  @Inject() attachUsbDeviceToVmService: AttachUsbDeviceToVmService
  @Inject() detachUsbDeviceToVmService: DetachUsbDeviceToVmService
  @Inject() addTpmToVmService: AddTpmToVmService
  @Inject() removeTpmFromVmService: RemoveTpmFromVmService
  @Inject() updateTpmService: UpdateTpmService
  @Inject() setVmQxlMemoryAction: SetVmQxlMemoryAction
  @Inject() setVmNicSecurityGroupService: SetVmNicSecurityGroupService
  @Inject() rebootVmInstanceAction: RebootVmInstanceAction
  @Inject() changeVmImageService: ChangeVmImageService
  @Inject() addResourcesToDirectoryService: AddResourcesToDirectoryService
  @Inject() setVmBootVolumeAction: SetVmBootVolumeAction
  @Inject() updateVmNetworkConfigService: UpdateVmNetworkConfigService

  @Mutation(() => ActionResult)
  editVmInstanceConfig(@Args('input') input: EditVmInstanceConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: EditVmInstanceConfigPayload, taskId: string) => {
        let tasks = []
        // 有些资源的删除/卸载操作 需要最先执行
        const preTasks = []
        const runServiceFun = async (
          _payload: any,
          actionFun: any,
          service: any,
          _tasks = tasks
        ) => {
          if (_payload) {
            if (_.isArray(_payload) && _payload?.length) {
              _tasks.push(..._payload.map(item => actionFun.call(service, item, taskId, actionId)))
            } else {
              _tasks.push(actionFun.call(service, _payload, taskId, actionId))
            }
          }
        }

        let volumeAttachList: {
          index: number
          volumeUuid: string
          fn: () => Promise<void>
        }[] = []

        // 卸载光驱
        runServiceFun(
          payload?.deleteCdRomPayload,
          this.deleteCdRomService.actionFn,
          this.deleteCdRomService,
          preTasks
        )
        // 卸载ISO
        runServiceFun(
          payload?.detachIsoFromVmInstancePayload,
          this.detachIsoFromVmInstanceService.actionFn,
          this.detachIsoFromVmInstanceService,
          preTasks
        )
        // 卸载GuestTools
        runServiceFun(
          payload?.detachGuestToolsIsoFromVmPayload,
          this.detachGuestToolsIsoFromVmService.actionFn,
          this.detachGuestToolsIsoFromVmService,
          preTasks
        )

        // 修改计算规格/修改默认网络/更换系统
        runServiceFun(
          payload?.updateVmInstancePayload,
          this.updateVmInstanceService.updateVminstanceFn,
          this.updateVmInstanceService,
          preTasks
        )

        await Promise.all(preTasks)

        // 修改cpu/内存优先级
        runServiceFun(
          payload?.updateVmPriorityPayload,
          this.updateVmPriorityService.actionFn,
          this.updateVmPriorityService
        )

        // 设置高可用
        runServiceFun(
          payload?.setVmHaLevelPayload,
          this.setVmHaLevelService.actionFn,
          this.setVmHaLevelService
        )
        // 设置分组
        runServiceFun(
          payload?.addResourcesToDirectoryPayload,
          this.addResourcesToDirectoryService.actionFn,
          this.addResourcesToDirectoryService
        )

        // 设置时间同步
        runServiceFun(
          payload?.setVmClockTrackPayload,
          this.setVmClockTrackService.actionFn,
          this.setVmClockTrackService
        )

        // 更改系统
        runServiceFun(
          payload?.changeVmImagePayload,
          this.changeVmImageService.actionFn,
          this.changeVmImageService
        )

        // 设置Bios时钟同步/设置故障策略
        if (payload?.updateResourceConfigActionParams?.length) {
          tasks = tasks.concat(
            payload?.updateResourceConfigActionParams.map(param =>
              this.updateResourceConfig(param, { actionId, taskId })
            )
          )
        }

        // 处理 cacheMode 和 aio 的 API 调用顺序
        // 在同时更新 cacheMode 和 aio 时
        // 1. 如果要打开 aio, 则先更新 cacheMode
        // 2. 如果要关闭 aio, 则先更新 aio
        if (payload?.updateCacheModeAndAioParams?.length) {
          Object.values(_.groupBy(payload.updateCacheModeAndAioParams, 'resourceUuid')).forEach(
            (param: any) => {
              const aio = param?.find((item: any) => item.name === 'aio.native')
              const cacheMode = param?.find((item: any) => item.name === 'vm.cacheMode')
              const actionInfo = { actionId, taskId }
              if (aio?.value === 'true') {
                tasks.push(
                  (async () => {
                    await this.updateResourceConfig(cacheMode, actionInfo)
                    await this.updateResourceConfig(aio, actionInfo)
                  })()
                )
              } else {
                tasks.push(
                  (async () => {
                    await this.updateResourceConfig(aio, actionInfo)
                    await this.updateResourceConfig(cacheMode, actionInfo)
                  })()
                )
              }
            }
          )
        }

        // 设置的显存
        if (payload?.setVmQxlMemoryPayload) {
          tasks.push(
            this.setVmQxlMemoryAction.call(payload?.setVmQxlMemoryPayload, {
              actionId,
              taskId
            })
          )
        }

        // 先删除不需要的GPU
        runServiceFun(
          payload?.detachPciDeviceFromVMPayloads,
          this.detachPciDeviceFromVMService.detachFromVmFn,
          this.detachPciDeviceFromVMService
        )

        // 先删除不需要的vGPU
        runServiceFun(
          payload?.detachVGpuFromVmInstancePayloads,
          this.detachVGpuFromVmInstanceService.actionFn,
          this.detachVGpuFromVmInstanceService
        )

        // 加载GPU
        runServiceFun(
          payload?.attachPciDeviceToVMPayloads,
          this.attachPciDeviceToVmService.attachPciDeviceToVmFn,
          this.attachPciDeviceToVmService
        )

        // 加载vGPU
        runServiceFun(
          payload?.attachVGpuToVmInstancePayloads,
          this.attachVGpuToVmInstanceService.actionFn,
          this.attachVGpuToVmInstanceService
        )

        // 设置GPU规格
        runServiceFun(
          payload?.setGpuDeviceSpecPayload,
          this.setVmInstanceGpuDeviceSpecService.setVmInstanceGpuOfferingFn,
          this.setVmInstanceGpuDeviceSpecService
        )

        // USB重定向
        runServiceFun(
          payload?.setVmUsbRedirectPayload,
          this.setVmUsbRedirectService.actionFn,
          this.setVmUsbRedirectService
        )

        runServiceFun(
          payload?.addTpmToVmPayload,
          this.addTpmToVmService.actionFn,
          this.addTpmToVmService
        )
        runServiceFun(
          payload?.removeTpmFromVmPayload,
          this.removeTpmFromVmService.actionFn,
          this.removeTpmFromVmService
        )
        runServiceFun(
          payload?.updateTpmPayload,
          this.updateTpmService.actionFn,
          this.updateTpmService
        )

        // 设置控制台模式
        runServiceFun(
          payload?.setVmConsoleModePayload,
          this.setVmConsoleModeService.actionFn,
          this.setVmConsoleModeService
        )

        // 加载云盘
        if (payload?.attachDataVolumeToVmPayload?.length) {
          volumeAttachList = volumeAttachList.concat(
            payload?.attachDataVolumeToVmPayload?.map(item => ({
              index: item.index,
              volumeUuid: item.volumeUuid,
              fn: async () =>
                await this.attachDataVolumeToVmService.actionFn.call(
                  this.attachDataVolumeToVmService,
                  item,
                  taskId,
                  actionId
                )
            }))
          )
        }
        // 加载lun设备
        if (payload?.attachScsiLunToVmInstancePayloads?.length) {
          volumeAttachList = volumeAttachList.concat(
            payload?.attachScsiLunToVmInstancePayloads?.map(item => ({
              index: item.index,
              volumeUuid: item.uuid,
              fn: async () =>
                await this.attachScsiLunToVmInstanceService.actionFn.call(
                  this.attachScsiLunToVmInstanceService,
                  item,
                  taskId,
                  actionId
                )
            }))
          )
        }
        // 创建云盘
        if (payload.createDataVolumeInEditVmPayload?.length) {
          tasks = tasks.concat(
            payload.createDataVolumeInEditVmPayload.map(async item => {
              const service = item.imageUuid
                ? this.createDataVolumeFromVolumeTemplateAction
                : this.createDataVolumeAction
              const _payload: any = item.imageUuid
                ? {
                    name: item.name,
                    primaryStorageUuid: item.primaryStorageUuid,
                    hostUuid: item.hostUuid,
                    imageUuid: item.imageUuid,
                    systemTags: item.systemTags
                  }
                : {
                    name: item.name,
                    primaryStorageUuid: item.primaryStorageUuid,
                    diskSize: item.diskSize,
                    systemTags: item.systemTags
                  }
              return service.call(_payload, { taskId, actionId }).then(resp => {
                const volumeUuid = resp.inventory.uuid
                const tasks = []
                if (item.aio) {
                  tasks.push(
                    this.updateResourceConfigAction.call(
                      {
                        name: 'aio.native',
                        category: 'mevoco',
                        resourceUuid: volumeUuid,
                        value: item.aio.toString()
                      },
                      { taskId, actionId }
                    )
                  )
                }
                if (item.cacheMode) {
                  tasks.push(
                    this.updateResourceConfigAction.call(
                      {
                        name: 'vm.cacheMode',
                        category: 'kvm',
                        resourceUuid: volumeUuid,
                        value: item.cacheMode
                      },
                      { taskId, actionId }
                    )
                  )
                }
                if (item.cacheMode) {
                  tasks.push(
                    this.setVolumeQosService.actionFn(
                      {
                        uuid: volumeUuid,
                        readBandwidth: item.readBandwidth,
                        writeBandwidth: item.writeBandwidth,
                        totalBandwidth: item.totalBandwidth,
                        readIOPS: item.readIOPS,
                        writeIOPS: item.writeIOPS,
                        totalIOPS: item.totalIOPS
                      },
                      taskId,
                      actionId
                    )
                  )
                }

                volumeAttachList.push({
                  index: item.index,
                  volumeUuid,
                  fn: async () => {
                    await this.attachDataVolumeToVmAction.call(
                      {
                        vmInstanceUuid: payload.resourceUuid,
                        volumeUuid: volumeUuid
                      },
                      {
                        actionId,
                        taskId
                      }
                    )
                  }
                })

                return Promise.all(tasks)
              })
            })
          )
        }

        //卸载lun设备
        runServiceFun(
          payload?.detachScsiLunFromVmInstancePayloads,
          this.detachScsiLunFromVmInstanceService.actionFn,
          this.detachScsiLunFromVmInstanceService
        )

        // 创建光驱
        runServiceFun(
          payload?.attachIsoToVmInstancePayload,
          this.attachIsoToVmInstanceService.actionFn,
          this.attachIsoToVmInstanceService
        )

        //指定物理机启动
        runServiceFun(
          payload?.startVmInstanceFromHostPayload,
          this.startVmInstanceFromHostService.actionFn,
          this.startVmInstanceFromHostService
        )
        //修改云主机密码
        runServiceFun(
          payload?.changeVmPasswordPayload,
          this.changeVmPasswordService.actionFn,
          this.changeVmPasswordService
        )
        // 删除云主机console密码
        runServiceFun(
          payload?.deleteVmConsolePasswordPayload,
          this.deleteVmConsolePasswordService.actionFn,
          this.deleteVmConsolePasswordService
        )
        //设置云主机console密码
        runServiceFun(
          payload?.setVmConsolePasswordPayload,
          this.setVmConsolePasswordService.actionFn,
          this.setVmConsolePasswordService
        )
        //设置云主机启动顺序
        runServiceFun(
          payload?.setVmBootOrderPayload,
          this.setVmBootOrderService.actionFn,
          this.setVmBootOrderService
        )
        // 移除跨集群高可用
        runServiceFun(
          payload?.removeHaStickStragedyPayload,
          this.removeHaStickStragedyService.actionFn,
          this.setVmBootOrderService
        )
        // 设置设置跨集群高可用
        runServiceFun(
          payload?.setHaStickStragedyPayload,
          this.setHaStickStragedyService.actionFn,
          this.setHaStickStragedyService
        )
        // ******云盘相关操作
        //设置云盘大小
        runServiceFun(
          payload?.resizeDataVolumePayload,
          this.resizeDataVolumeService.actionFn,
          this.resizeDataVolumeService
        )

        //删除云盘qos限制
        runServiceFun(
          payload?.deleteVolumeQosPayload,
          this.deleteVolumeQosService.actionFn,
          this.deleteVolumeQosService
        )

        //设置云盘qos限制
        runServiceFun(
          payload?.setVolumeQosPayload,
          this.setVolumeQosService.actionFn,
          this.setVolumeQosService
        )
        // *******网卡操作
        //绑定网卡
        if (payload.attachL3NetworkToVmNicInEditVmPayload?.length) {
          tasks = tasks.concat(
            payload.attachL3NetworkToVmNicInEditVmPayload.map(item => {
              return this.attachL3NetworkToVmNicService.actionFn
                .call(
                  this.attachL3NetworkToVmNicService,
                  {
                    multiQueueNum: item.multiQueueNum,
                    vmInstanceUuid: item.vmInstanceUuid,
                    l3NetworkUuid: item.l3NetworkUuid,
                    driverType: item.driverType,
                    staticIpv4: item.staticIpv4,
                    staticIpv6: item.staticIpv6,
                    customMac: item.customMac,
                    systemTags: item.systemTags,
                    vmNicParams: item.vmNicParams
                  },
                  taskId,
                  actionId
                )
                .then(resp => {
                  const nicUuid = resp.nicUuid
                  const tasks = []
                  if (item.inboundBandwidth > 0 || item.outboundBandwidth > 0) {
                    tasks.push(
                      this.setNicQosService.actionFn(
                        {
                          uuid: nicUuid,
                          inboundBandwidth:
                            item.inboundBandwidth > 0 ? item.inboundBandwidth : undefined,
                          outboundBandwidth:
                            item.outboundBandwidth > 0 ? item.outboundBandwidth : undefined
                        },
                        taskId,
                        actionId
                      )
                    )
                  }
                  return Promise.all(tasks)
                })
            })
          )
        }

        //解绑网卡
        if (payload.detachL3NetworkFromVmPayload?.length) {
          tasks = tasks.concat(
            payload.detachL3NetworkFromVmPayload.map(item =>
              this.detachL3NetworkFromVmAction.call(
                { vmNicUuid: item.vmNicUuid },
                { taskId, actionId }
              )
            )
          )
        }

        // 下发网络配置
        if (payload.updateVmNetworkConfigPayload?.length) {
          tasks = tasks.concat(
            payload.updateVmNetworkConfigPayload.map(item =>
              this.updateVmNetworkConfigService.syncConfig(item, {
                taskId,
                actionId
              })
            )
          )
        }

        // 设置安全组
        if (payload.setVmNicSecurityGroupInEditPayload?.length) {
          tasks = tasks.concat(
            payload.setVmNicSecurityGroupInEditPayload.map(item =>
              this.setVmNicSecurityGroupService.actionFn.call(
                this.setVmNicSecurityGroupService,
                item,
                {
                  actionId,
                  taskId
                }
              )
            )
          )
        }

        //修改网卡状态
        runServiceFun(
          payload?.changeVmNicNetworkPayload,
          this.changeVmNicNetworkService.actionFn,
          this.changeVmNicNetworkService
        )

        //修改网卡状态
        runServiceFun(
          payload?.changeVmNicStatePayload,
          this.changeVmNicStateService.actionFn,
          this.changeVmNicStateService
        )

        //设置网卡静态ip
        runServiceFun(
          payload?.setVmStaticIpPayload,
          this.setVmStaticIpService.actionFn,
          this.setVmStaticIpService
        )
        //删除网卡静态IP
        runServiceFun(
          payload?.deleteVmStaticIpPayload,
          this.deleteVmStaticIpService.actionFn,
          this.deleteVmStaticIpService
        )

        // 设置 DNS
        runServiceFun(payload?.setVmDnsPayload, this.setVmDnsService.actionFn, this.setVmDnsService)

        //设置网卡qos
        runServiceFun(
          payload?.setNicQosPayload,
          this.setNicQosService.actionFn,
          this.setNicQosService
        )

        //设置网卡MAC 地址
        runServiceFun(
          payload?.updateVmNicMacPayload,
          this.updateVmNicMacService.actionFn,
          this.updateVmNicMacService
        )

        //网卡解绑安全组
        runServiceFun(
          payload?.vmNicUnBindSecurityGroupPayload,
          this.vmNicUnBindSecurityGroupService.actionFn,
          this.updateVmNicMacService
        )

        //网卡绑定安全组
        runServiceFun(
          payload?.vmNicBindSecurityGroupPayload,
          this.vmNicBindSecurityGroupService.actionFn,
          this.vmNicBindSecurityGroupService
        )

        //设置网卡型号
        runServiceFun(
          payload?.updateVmNicDriverPayload,
          this.updateVmNicDriverService.actionFn,
          this.updateVmNicDriverService
        )

        await Promise.all(tasks)

        if (payload?.setSystemTagPayload?.length) {
          for (const item of payload.setSystemTagPayload) {
            await this.setSystemTagService.actionFn.call(
              this.setSystemTagService,
              item,
              taskId,
              actionId
            )
          }
        }

        // 加载ISO 带CD-ROM相关操作都进行后再执行 createVmCdRomPayload
        if (payload?.createVmCdRomPayload?.length) {
          await Promise.all(
            payload?.createVmCdRomPayload.map(
              async payload =>
                await this.createVmCdRomService.actionFn.call(
                  this.createVmCdRomService,
                  payload,
                  taskId,
                  actionId
                )
            )
          )
        }

        if (payload?.resizeRootVolumePayload?.length) {
          await Promise.all(
            payload?.resizeRootVolumePayload.map(
              async payload =>
                await this.resizeRootVolumeService.actionFn.call(
                  this.resizeRootVolumeService,
                  payload,
                  taskId,
                  actionId
                )
            )
          )
        }

        // 加载云盘 需要串行调用，保证顺序
        if (volumeAttachList?.length) {
          for (const item of _.sortBy(volumeAttachList, 'index')) {
            await item.fn()
          }
        }

        // 更换系统盘
        if (payload?.setVmBootVolumePayload) {
          if (payload.setVmBootVolumePayload.volumeUuid === '__newDisk__') {
            payload.setVmBootVolumePayload.volumeUuid = _.minBy(
              volumeAttachList,
              'index'
            ).volumeUuid
          }
          await this.setVmBootVolumeAction.call(payload.setVmBootVolumePayload, {
            actionId,
            taskId
          })
        }

        // 卸载/删除硬盘
        const volumeTasks = []

        // 卸载硬盘
        runServiceFun(
          payload?.detachDataVolumeFromVmPayload,
          this.detachDataVolumeFromVmService.actionFn,
          this.detachDataVolumeFromVmService,
          volumeTasks
        )

        // 删除硬盘
        runServiceFun(
          payload?.deleteDataVolumePayload,
          this.deleteDataVolumeService.actionFn,
          this.deleteDataVolumeService,
          volumeTasks
        )

        await Promise.all(volumeTasks)

        // usb操作

        if (payload?.detachUsbDeviceToVmPayload?.length) {
          await Promise.all(
            payload?.detachUsbDeviceToVmPayload.map(
              async payload =>
                await this.detachUsbDeviceToVmService.actionFn.call(
                  this.detachUsbDeviceToVmService,
                  payload,
                  taskId,
                  actionId
                )
            )
          )
        }
        if (payload?.attachUsbDeviceToVmPayload) {
          await Promise.all(
            payload?.attachUsbDeviceToVmPayload.map(
              async payload =>
                await this.attachUsbDeviceToVmService.actionFn.call(
                  this.attachUsbDeviceToVmService,
                  payload,
                  taskId,
                  actionId
                )
            )
          )
        }

        if (payload.neeeReboot) {
          await this.rebootVmInstanceAction.call(
            { uuid: payload.resourceUuid },
            { actionId, taskId }
          )
        }

        return {
          id: payload.resourceUuid
        }
      },
      { resourceUuids: input.payload.map(item => item.resourceUuid) }
    )
    return { actionId }
  }

  private async updateResourceConfig(param?: ResourceConfigPayload, actionInfo?: ActionInfo) {
    if (!param) {
      return
    }
    if (!param.value) {
      await this.deleteResourceConfigAction.call(
        {
          resourceUuid: param.resourceUuid,
          category: param.category,
          name: param.name
        },
        actionInfo
      )
    } else {
      await this.updateResourceConfigAction.call(
        {
          resourceUuid: param.resourceUuid,
          category: param.category,
          name: param.name,
          value: param.value
        },
        actionInfo
      )
    }
  }
}
