import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation, registerEnumType } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { SetSystemTagPayload, SetSystemTagService } from '@/common/system-tag/set-system-tag'
import { AttachPciDeviceToVMPayload } from '@/hardware-resource/pci-device/action/attach-to-vm'
import { DetachPciDeviceFromVMPayload } from '@/hardware-resource/pci-device/action/detach-from-vm'
import { AttachScsiLunToVmInstancePayload } from '@/hardware-resource/scsi-lun/action/attach-scsi-lun-to-vm-instance'
import { DetachScsiLunFromVmInstancePayload } from '@/hardware-resource/scsi-lun/action/detach-scsi-lun-from-vm-instance'
import { AttachUsbDeviceToVmPayload } from '@/hardware-resource/usb-device/action/attach-usb'
import { DetachUsbDeviceToVmPayload } from '@/hardware-resource/usb-device/action/detach-usb'
import { AttachVGpuToVmInstancePayload } from '@/hardware-resource/vgpu-device/action/attach-to-vm'
import { DetachVGpuFromVmInstancePayload } from '@/hardware-resource/vgpu-device/action/detach-from-vm'
import {
  ManagementTagPayload,
  ManagementTagService
} from '@/zsphere-administration/tag/action/management-tag'
import { CreateVmCdRomPayload } from '@/zsphere-resource/cdroms/action/create-cdrom'
import { DeleteCdRomPayload } from '@/zsphere-resource/cdroms/action/delete'
import { AddResourcesToDirectoryPayload } from '@/zsphere-resource/vm-directory-group/action/add-resources-to-directory'
import { AttachDataVolumeToVmPayload } from '@/zsphere-resource/vm-instance/action/attach-data-volume-to-vm'
import { AttachIsoToVmInstancePayload } from '@/zsphere-resource/vm-instance/action/attach-iso-to-vm-instance'
import { ChangeVmImagePayload } from '@/zsphere-resource/vm-instance/action/change-vm-image'
import { ChangeVmPasswordPayload } from '@/zsphere-resource/vm-instance/action/change-vm-password'
import { DeleteVmConsolePasswordPayload } from '@/zsphere-resource/vm-instance/action/delete-console-password'
import { DetachDataVolumeFromVmPayload } from '@/zsphere-resource/vm-instance/action/detach-data-volume-from-vm'
import { DetachIsoFromVmInstancePayload } from '@/zsphere-resource/vm-instance/action/detach-iso-from-vm-instance'
import {
  AttachL3NetworkToVmNicInEditVmPayload,
  CreateDataVolumeInEditVmPayload,
  ResourceConfigPayload,
  SetVmNicSecurityGroupInEditPayload,
  SetVmQxlMemoryPayload
} from '@/zsphere-resource/vm-instance/action/edit-vm-config'
import { RemoveHaStickStragedyPayload } from '@/zsphere-resource/vm-instance/action/remove-hastickstragedy'
import {
  ResizeRootVolumePayload,
  ResizeRootVolumeService
} from '@/zsphere-resource/vm-instance/action/resize-root-volume'
import { SetVmConsoleModePayload } from '@/zsphere-resource/vm-instance/action/set-consle-mode'
import { SetVmConsolePasswordPayload } from '@/zsphere-resource/vm-instance/action/set-console-password'
import { SetGpuDeviceSpecPayload } from '@/zsphere-resource/vm-instance/action/set-gpu-offering'
import { SetHaStickStragedyPayload } from '@/zsphere-resource/vm-instance/action/set-hastickstragedy'
import { SetVmClockTrackPayload } from '@/zsphere-resource/vm-instance/action/set-time-sync'
import { SetVmUsbRedirectPayload } from '@/zsphere-resource/vm-instance/action/set-usb-redirect'
import { SetVmBootOrderPayload } from '@/zsphere-resource/vm-instance/action/set-vm-bootorder'
import { SetVmHaLevelPayload } from '@/zsphere-resource/vm-instance/action/set-vm-ha'
import { StartVmInstanceFromHostPayload } from '@/zsphere-resource/vm-instance/action/start-vm-from-host'
import { UpdateVmPriorityPayload } from '@/zsphere-resource/vm-instance/action/update-vm-priority'
import { DeleteDataVolumePayload } from '@/zsphere-resource/volume/action/delete-data-volume'

import { VmNicBindSecurityGroupPayload } from '../../vm-nic/action/bind-security-gourp'
import { DeleteVmStaticIpPayload } from '../../vm-nic/action/delete-static-ip'
import { UpdateVmNicDriverPayload } from '../../vm-nic/action/set-drive-type'
import { ChangeVmNicNetworkPayload } from '../../vm-nic/action/set-ip-address'
import { SetNicQosPayload } from '../../vm-nic/action/set-qos'
import { ChangeVmNicStatePayload } from '../../vm-nic/action/set-state'
//网卡相关操作
import { SetVmStaticIpPayload } from '../../vm-nic/action/set-static-ip'
import { VmNicUnBindSecurityGroupPayload } from '../../vm-nic/action/unbind-security-group'
import { UpdateVmNicMacPayload } from '../../vm-nic/action/update-mac'
import { DeleteVolumeQosPayload } from '../../volume/action/delete-volume-qos'
//云盘相关操作
import {
  ResizeDataVolumePayload,
  ResizeDataVolumeService
} from '../../volume/action/resize-data-volume'
import { SetVolumeQosPayload } from '../../volume/action/set-volume-qos'
import { UpdateVmTemplatePayload, UpdateVmTemplateService } from './update'

enum EditTemplatedVMActionType {
  Add,
  Delete,
  Update
}

registerEnumType(EditTemplatedVMActionType, {
  name: 'EditTemplatedVMActionType'
})

enum EditTemplatedVMResourceType {
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

registerEnumType(EditTemplatedVMResourceType, {
  name: 'EditTemplatedVMResourceType'
})

@InputType()
class AttachScsiLunToVmInstancePayloadInEditInTemplatedVM extends AttachScsiLunToVmInstancePayload {
  @Field(() => Int)
  index: number
}

@InputType()
class AttachDataVolumeToTemplatedVmPayloadInEdit extends AttachDataVolumeToVmPayload {
  @Field(() => Int)
  index: number
}

@InputType()
class DetachL3NetworkFromTemplatedVmInVmEditPayload {
  @Field(() => String)
  vmNicUuid: string
}

@InputType()
export class EditTemplatedVMConfigPayload {
  @Field(() => String)
  resourceUuid: string

  @Field(() => Boolean, { nullable: true })
  neeeReboot?: boolean

  @Field(() => EditTemplatedVMActionType, { nullable: true })
  actionType: EditTemplatedVMActionType

  @Field(() => EditTemplatedVMResourceType, { nullable: true })
  resourceType: EditTemplatedVMResourceType

  @Field(() => UpdateVmTemplatePayload, { nullable: true })
  updateTemplatedVMPayload?: UpdateVmTemplatePayload

  @Field(() => SetVmHaLevelPayload, { nullable: true })
  setVmHaLevelPayload?: SetVmHaLevelPayload

  @Field(() => AddResourcesToDirectoryPayload, { nullable: true })
  addResourcesToDirectoryPayload?: AddResourcesToDirectoryPayload

  @Field(() => SetVmClockTrackPayload, { nullable: true })
  setVmClockTrackPayload?: SetVmClockTrackPayload

  @Field(() => [ResourceConfigPayload], { nullable: true })
  updateResourceConfigActionParams?: ResourceConfigPayload[]

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

  @Field(() => [AttachScsiLunToVmInstancePayloadInEditInTemplatedVM], {
    nullable: true
  })
  attachScsiLunToVmInstancePayloads?: AttachScsiLunToVmInstancePayloadInEditInTemplatedVM[]

  @Field(() => [DetachScsiLunFromVmInstancePayload], { nullable: true })
  detachScsiLunFromVmInstancePayloads?: DetachScsiLunFromVmInstancePayload[]

  @Field(() => SetGpuDeviceSpecPayload, { nullable: true })
  setGpuDeviceSpecPayload?: SetGpuDeviceSpecPayload

  @Field(() => SetVmUsbRedirectPayload, { nullable: true })
  setVmUsbRedirectPayload?: SetVmUsbRedirectPayload

  @Field(() => SetVmConsoleModePayload, { nullable: true })
  setVmConsoleModePayload?: SetVmConsoleModePayload

  @Field(() => [AttachDataVolumeToTemplatedVmPayloadInEdit], { nullable: true })
  attachDataVolumeToVmPayload?: AttachDataVolumeToTemplatedVmPayloadInEdit[]

  @Field(() => [DetachDataVolumeFromVmPayload], { nullable: true })
  detachDataVolumeFromVmPayload?: DetachDataVolumeFromVmPayload[]

  @Field(() => [DetachIsoFromVmInstancePayload], { nullable: true })
  detachIsoFromVmInstancePayload?: DetachIsoFromVmInstancePayload[]

  @Field(() => [AttachIsoToVmInstancePayload], { nullable: true })
  attachIsoToVmInstancePayload?: AttachIsoToVmInstancePayload[]

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

  @Field(() => [DetachL3NetworkFromTemplatedVmInVmEditPayload], {
    nullable: true
  })
  detachL3NetworkFromVmPayload?: DetachL3NetworkFromTemplatedVmInVmEditPayload[]

  @Field(() => [SetVmStaticIpPayload], { nullable: true })
  setVmStaticIpPayload?: SetVmStaticIpPayload[]

  @Field(() => [ChangeVmNicNetworkPayload], { nullable: true })
  changeVmNicNetworkPayload?: ChangeVmNicNetworkPayload[]

  @Field(() => [DeleteVmStaticIpPayload], { nullable: true })
  deleteVmStaticIpPayload?: DeleteVmStaticIpPayload[]

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

  @Field(() => ManagementTagPayload, { nullable: true })
  managementTagPayload?: ManagementTagPayload
}

@InputType()
export class EditTemplatedVMConfigInput {
  @Field(() => [EditTemplatedVMConfigPayload])
  payload: EditTemplatedVMConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditVmTemplateConfigService extends ActionService {
  @Inject() updateTemplatedVMService: UpdateVmTemplateService
  @Inject() resizeDataVolumeService: ResizeDataVolumeService
  @Inject() setSystemTagService: SetSystemTagService
  //@Inject() rebootVmInstanceAction: RebootVmInstanceAction
  @Inject() resizeRootVolumeService: ResizeRootVolumeService
  @Inject() managementTagService: ManagementTagService

  // @Inject() updateVmPriorityService: UpdateVmPriorityService
  // @Inject() setVmHaLevelService: SetVmHaLevelService
  // @Inject() setVmClockTrackService: SetVmClockTrackService
  // @Inject() updateResourceConfigAction: UpdateResourceConfigAction
  // @Inject() deleteResourceConfigAction: DeleteResourceConfigAction
  // @Inject() attachPciDeviceToVmService: AttachPciDeviceToVmService
  // @Inject() detachPciDeviceFromVMService: DetachPciDeviceFromVMService
  // @Inject() setVmInstanceGpuDeviceSpecService: SetVmInstanceGpuDeviceSpecService
  // @Inject() attachVGpuToVmInstanceService: AttachVGpuToVmInstanceService
  // @Inject() detachVGpuFromVmInstanceService: DetachVGpuFromVmInstanceService
  // @Inject() setVmUsbRedirectService: SetVmUsbRedirectService
  // @Inject() setVmConsoleModeService: SetVmConsoleModeService
  // @Inject() attachDataVolumeToVmService: AttachDataVolumeToVmService
  // @Inject() detachDataVolumeFromVmService: DetachDataVolumeFromVmService
  // @Inject() detachIsoFromVmInstanceService: DetachIsoFromVmInstanceService
  // @Inject() attachIsoToVmInstanceService: AttachIsoToVmInstanceService
  // @Inject() attachScsiLunToVmInstanceService: AttachScsiLunToVmInstanceService
  // @Inject()
  // detachScsiLunFromVmInstanceService: DetachScsiLunFromVmInstanceService

  // @Inject() startVmInstanceFromHostService: StartVmInstanceFromHostService
  // @Inject() changeVmPasswordService: ChangeVmPasswordService
  // @Inject() setVmConsolePasswordService: SetVmConsolePasswordService
  // @Inject() deleteVmConsolePasswordService: DeleteVmConsolePasswordService
  // @Inject() setVmBootOrderService: SetVmBootOrderService
  // @Inject() setHaStickStragedyService: SetHaStickStragedyService
  // @Inject() removeHaStickStragedyService: RemoveHaStickStragedyService
  // @Inject() deleteVolumeQosService: DeleteVolumeQosService
  // @Inject() setVolumeQosService: SetVolumeQosService
  // @Inject() attachL3NetworkToVmNicService: AttachL3NetworkToVmNicService
  // @Inject() detachL3NetworkFromVmAction: DetachL3NetworkFromVmAction
  // @Inject() setVmStaticIpService: SetVmStaticIpService
  // @Inject() deleteVmStaticIpService: DeleteVmStaticIpService
  // @Inject() setNicQosService: SetNicQosService
  // @Inject() updateVmNicMacService: UpdateVmNicMacService
  // @Inject() vmNicBindSecurityGroupService: VmNicBindSecurityGroupService
  // @Inject() vmNicUnBindSecurityGroupService: VmNicUnBindSecurityGroupService
  // @Inject() updateVmNicDriverService: UpdateVmNicDriverService
  // @Inject() changeVmNicStateService: ChangeVmNicStateService
  // @Inject() attachDataVolumeToVmAction: AttachDataVolumeToVmAction
  // @Inject() createDataVolumeAction: CreateDataVolumeAction
  // @Inject()
  // createDataVolumeFromVolumeTemplateAction: CreateDataVolumeFromVolumeTemplateAction
  // @Inject() deleteDataVolumeService: DeleteDataVolumeService
  // @Inject() createVmCdRomService: CreateVmCdRomService
  // @Inject() deleteCdRomService: DeleteCdRomService
  // @Inject() changeVmNicNetworkService: ChangeVmNicNetworkService
  // @Inject() attachUsbDeviceToVmService: AttachUsbDeviceToVmService
  // @Inject() detachUsbDeviceToVmService: DetachUsbDeviceToVmService
  // @Inject() setVmQxlMemoryAction: SetVmQxlMemoryAction
  // @Inject() setVmNicSecurityGroupService: SetVmNicSecurityGroupService
  // @Inject() changeVmImageService: ChangeVmImageService
  // @Inject() addResourcesToDirectoryService: AddResourcesToDirectoryService

  @Mutation(() => ActionResult)
  editVmTemplateConfig(@Args('input') input: EditTemplatedVMConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmTemplate',
      async (payload: EditTemplatedVMConfigPayload, taskId: string) => {
        const tasks = []
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
              _tasks = _tasks.concat(
                _payload.map(item => actionFun.call(service, item, taskId, actionId))
              )
            } else {
              _tasks.push(actionFun.call(service, _payload, taskId, actionId))
            }
          }
        }

        //    let volumeAttachList: { index: number; fn: () => void }[] = []

        // // 卸载光驱
        // runServiceFun(
        //   payload?.deleteCdRomPayload,
        //   this.deleteCdRomService.actionFn,
        //   this.deleteCdRomService,
        //   preTasks
        // )
        // // 卸载ISO
        // runServiceFun(
        //   payload?.detachIsoFromVmInstancePayload,
        //   this.detachIsoFromVmInstanceService.actionFn,
        //   this.detachIsoFromVmInstanceService,
        //   preTasks
        // )

        await Promise.all(preTasks)

        // 修改计算规格/修改默认网络/更换系统
        runServiceFun(
          payload?.updateTemplatedVMPayload,
          this.updateTemplatedVMService.updateTemplatedVMFn,
          this.updateTemplatedVMService
        )

        // // 修改cpu/内存优先级
        // runServiceFun(
        //   payload?.updateVmPriorityPayload,
        //   this.updateVmPriorityService.actionFn,
        //   this.updateVmPriorityService
        // )

        // // 设置高可用
        // runServiceFun(
        //   payload?.setVmHaLevelPayload,
        //   this.setVmHaLevelService.actionFn,
        //   this.setVmHaLevelService
        // )
        // // 设置分组
        // runServiceFun(
        //   payload?.addResourcesToDirectoryPayload,
        //   this.addResourcesToDirectoryService.actionFn,
        //   this.addResourcesToDirectoryService
        // )

        // // 设置时间同步
        // runServiceFun(
        //   payload?.setVmClockTrackPayload,
        //   this.setVmClockTrackService.actionFn,
        //   this.setVmClockTrackService
        // )

        // // 更改系统
        // runServiceFun(
        //   payload?.changeVmImagePayload,
        //   this.changeVmImageService.actionFn,
        //   this.changeVmImageService
        // )

        // // 设置Bios时钟同步/设置故障策略
        // if (payload?.updateResourceConfigActionParams?.length) {
        //   tasks = tasks.concat(
        //     payload?.updateResourceConfigActionParams.map(param => {
        //       if (!param.value) {
        //         return this.deleteResourceConfigAction.call(
        //           {
        //             resourceUuid: param.resourceUuid,
        //             category: param.category,
        //             name: param.name
        //           },
        //           { actionId, taskId }
        //         )
        //       } else
        //         return this.updateResourceConfigAction.call(
        //           {
        //             resourceUuid: param.resourceUuid,
        //             category: param.category,
        //             name: param.name,
        //             value: param.value
        //           },
        //           { actionId, taskId }
        //         )
        //     })
        //   )
        // }

        // // 设置的显存
        // if (payload?.setVmQxlMemoryPayload) {
        //   tasks.push(
        //     this.setVmQxlMemoryAction.call(payload?.setVmQxlMemoryPayload, {
        //       actionId,
        //       taskId
        //     })
        //   )
        // }

        // // 先删除不需要的GPU
        // runServiceFun(
        //   payload?.detachPciDeviceFromVMPayloads,
        //   this.detachPciDeviceFromVMService.detachFromVmFn,
        //   this.detachPciDeviceFromVMService
        // )

        // // 先删除不需要的vGPU
        // runServiceFun(
        //   payload?.detachVGpuFromVmInstancePayloads,
        //   this.detachVGpuFromVmInstanceService.actionFn,
        //   this.detachVGpuFromVmInstanceService
        // )

        // // 加载GPU
        // runServiceFun(
        //   payload?.attachPciDeviceToVMPayloads,
        //   this.attachPciDeviceToVmService.attachPciDeviceToVmFn,
        //   this.attachPciDeviceToVmService
        // )

        // // 加载vGPU
        // runServiceFun(
        //   payload?.attachVGpuToVmInstancePayloads,
        //   this.attachVGpuToVmInstanceService.actionFn,
        //   this.attachVGpuToVmInstanceService
        // )

        // // 设置GPU规格
        // runServiceFun(
        //   payload?.setGpuDeviceSpecPayload,
        //   this.setVmInstanceGpuDeviceSpecService.setVmInstanceGpuOfferingFn,
        //   this.setVmInstanceGpuDeviceSpecService
        // )

        // // USB重定向
        // runServiceFun(
        //   payload?.setVmUsbRedirectPayload,
        //   this.setVmUsbRedirectService.actionFn,
        //   this.setVmUsbRedirectService
        // )

        // // 设置控制台模式
        // runServiceFun(
        //   payload?.setVmConsoleModePayload,
        //   this.setVmConsoleModeService.actionFn,
        //   this.setVmConsoleModeService
        // )

        // // 卸载云盘
        // runServiceFun(
        //   payload?.detachDataVolumeFromVmPayload,
        //   this.detachDataVolumeFromVmService.actionFn,
        //   this.detachDataVolumeFromVmService
        // )
        // // 加载云盘
        // if (payload?.attachDataVolumeToVmPayload?.length)
        //   volumeAttachList = volumeAttachList.concat(
        //     payload?.attachDataVolumeToVmPayload?.map(item => ({
        //       index: item.index,
        //       fn: async () =>
        //         await this.attachDataVolumeToVmService.actionFn.call(
        //           this.attachDataVolumeToVmService,
        //           item,
        //           taskId,
        //           actionId
        //         )
        //     }))
        //   )

        // // 加载lun设备
        // if (payload?.attachScsiLunToVmInstancePayloads?.length)
        //   volumeAttachList = volumeAttachList.concat(
        //     payload?.attachScsiLunToVmInstancePayloads?.map(item => ({
        //       index: item.index,
        //       fn: async () =>
        //         await this.attachScsiLunToVmInstanceService.actionFn.call(
        //           this.attachScsiLunToVmInstanceService,
        //           item,
        //           taskId,
        //           actionId
        //         )
        //     }))
        //   )

        // // 创建云盘
        // if (payload.createDataVolumeInEditVmPayload?.length) {
        //   tasks = tasks.concat(
        //     payload.createDataVolumeInEditVmPayload.map(async item => {
        //       const service = item.imageUuid
        //         ? this.createDataVolumeFromVolumeTemplateAction
        //         : this.createDataVolumeAction
        //       const _payload: any = item.imageUuid
        //         ? {
        //           name: item.name,
        //           primaryStorageUuid: item.primaryStorageUuid,
        //           hostUuid: item.hostUuid,
        //           imageUuid: item.imageUuid,
        //           systemTags: item.systemTags
        //         }
        //         : {
        //           name: item.name,
        //           primaryStorageUuid: item.primaryStorageUuid,
        //           diskSize: item.diskSize,
        //           systemTags: item.systemTags
        //         }
        //       return service.call(_payload, { taskId, actionId }).then(resp => {
        //         const volumeUuid = resp.inventory.uuid
        //         const tasks = []
        //         if (item.aio)
        //           tasks.push(
        //             this.updateResourceConfigAction.call(
        //               {
        //                 name: 'aio.native',
        //                 category: 'mevoco',
        //                 resourceUuid: volumeUuid,
        //                 value: item.aio.toString()
        //               },
        //               { taskId, actionId }
        //             )
        //           )

        //         if (item.cacheMode)
        //           tasks.push(
        //             this.updateResourceConfigAction.call(
        //               {
        //                 name: 'vm.cacheMode',
        //                 category: 'kvm',
        //                 resourceUuid: volumeUuid,
        //                 value: item.cacheMode
        //               },
        //               { taskId, actionId }
        //             )
        //           )

        //         tasks.push(
        //           this.setVolumeQosService.actionFn(
        //             {
        //               uuid: volumeUuid,
        //               readBandwidth: item.readBandwidth,
        //               writeBandwidth: item.writeBandwidth,
        //               totalBandwidth: item.totalBandwidth,
        //               readIOPS: item.readIOPS,
        //               writeIOPS: item.writeIOPS,
        //               totalIOPS: item.totalIOPS
        //             },
        //             taskId,
        //             actionId
        //           )
        //         )

        //         volumeAttachList.push({
        //           index: item.index,
        //           fn: async () =>
        //             await this.attachDataVolumeToVmAction.call(
        //               {
        //                 vmInstanceUuid: payload.resourceUuid,
        //                 volumeUuid: volumeUuid
        //               },
        //               {
        //                 actionId,
        //                 taskId
        //               }
        //             )
        //         })

        //         return Promise.all(tasks)
        //       })
        //     })
        //   )
        // }

        // // 删除云盘
        // runServiceFun(
        //   payload?.deleteDataVolumePayload,
        //   this.deleteDataVolumeService.actionFn,
        //   this.deleteDataVolumeService
        // )

        // //卸载lun设备
        // runServiceFun(
        //   payload?.detachScsiLunFromVmInstancePayloads,
        //   this.detachScsiLunFromVmInstanceService.actionFn,
        //   this.detachScsiLunFromVmInstanceService
        // )

        // // 创建光驱
        // runServiceFun(
        //   payload?.attachIsoToVmInstancePayload,
        //   this.attachIsoToVmInstanceService.actionFn,
        //   this.attachIsoToVmInstanceService
        // )

        // //指定物理机启动
        // runServiceFun(
        //   payload?.startVmInstanceFromHostPayload,
        //   this.startVmInstanceFromHostService.actionFn,
        //   this.startVmInstanceFromHostService
        // )
        // //修改云主机密码
        // runServiceFun(
        //   payload?.changeVmPasswordPayload,
        //   this.changeVmPasswordService.actionFn,
        //   this.changeVmPasswordService
        // )
        // // 删除云主机console密码
        // runServiceFun(
        //   payload?.deleteVmConsolePasswordPayload,
        //   this.deleteVmConsolePasswordService.actionFn,
        //   this.deleteVmConsolePasswordService
        // )
        // //设置云主机console密码
        // runServiceFun(
        //   payload?.setVmConsolePasswordPayload,
        //   this.setVmConsolePasswordService.actionFn,
        //   this.setVmConsolePasswordService
        // )
        // //设置云主机启动顺序
        // runServiceFun(
        //   payload?.setVmBootOrderPayload,
        //   this.setVmBootOrderService.actionFn,
        //   this.setVmBootOrderService
        // )
        // // 移除跨集群高可用
        // runServiceFun(
        //   payload?.removeHaStickStragedyPayload,
        //   this.removeHaStickStragedyService.actionFn,
        //   this.setVmBootOrderService
        // )
        // // 设置设置跨集群高可用
        // runServiceFun(
        //   payload?.setHaStickStragedyPayload,
        //   this.setHaStickStragedyService.actionFn,
        //   this.setHaStickStragedyService
        // )
        // ******云盘相关操作
        //设置云盘大小
        runServiceFun(
          payload?.resizeDataVolumePayload,
          this.resizeDataVolumeService.actionFn,
          this.resizeDataVolumeService
        )

        // //删除云盘qos限制
        // runServiceFun(
        //   payload?.deleteVolumeQosPayload,
        //   this.deleteVolumeQosService.actionFn,
        //   this.deleteVolumeQosService
        // )

        // //设置云盘qos限制
        // runServiceFun(
        //   payload?.setVolumeQosPayload,
        //   this.setVolumeQosService.actionFn,
        //   this.setVolumeQosService
        // )
        // *******网卡操作
        //绑定网卡
        // if (payload.attachL3NetworkToVmNicInEditVmPayload?.length) {
        //   tasks = tasks.concat(
        //     payload.attachL3NetworkToVmNicInEditVmPayload.map(item => {
        //       return this.attachL3NetworkToVmNicService.actionFn
        //         .call(
        //           this.attachL3NetworkToVmNicService,
        //           {
        //             multiQueueNum: item.multiQueueNum,
        //             vmInstanceUuid: item.vmInstanceUuid,
        //             l3NetworkUuid: item.l3NetworkUuid,
        //             driverType: item.driverType,
        //             staticIpv4: item.staticIpv4,
        //             customMac: item.customMac,
        //             systemTags: item.systemTags,
        //             vmNicParams: item.vmNicParams
        //           },
        //           taskId,
        //           actionId
        //         )
        //         .then(resp => {
        //           const nicUuid = resp.nicUuid
        //           const tasks = []
        //           if (item.inboundBandwidth > 0 || item.outboundBandwidth > 0)
        //             tasks.push(
        //               this.setNicQosService.actionFn(
        //                 {
        //                   uuid: nicUuid,
        //                   inboundBandwidth:
        //                     item.inboundBandwidth > 0
        //                       ? item.inboundBandwidth
        //                       : undefined,
        //                   outboundBandwidth:
        //                     item.outboundBandwidth > 0
        //                       ? item.outboundBandwidth
        //                       : undefined
        //                 },
        //                 taskId,
        //                 actionId
        //               )
        //             )
        //           return Promise.all(tasks)
        //         })
        //     })
        //   )
        // }

        // //解绑网卡
        // if (payload.detachL3NetworkFromVmPayload?.length) {
        //   tasks = tasks.concat(
        //     payload.detachL3NetworkFromVmPayload.map(item =>
        //       this.detachL3NetworkFromVmAction.call(
        //         { vmNicUuid: item.vmNicUuid },
        //         { taskId, actionId }
        //       )
        //     )
        //   )
        // }

        // // 设置安全组
        // if (payload.setVmNicSecurityGroupInEditPayload?.length) {
        //   tasks = tasks.concat(
        //     payload.setVmNicSecurityGroupInEditPayload.map(item =>
        //       this.setVmNicSecurityGroupService.actionFn.call(
        //         this.setVmNicSecurityGroupService,
        //         item,
        //         {
        //           actionId,
        //           taskId
        //         }
        //       )
        //     )
        //   )
        // }

        // //修改网卡状态
        // runServiceFun(
        //   payload?.changeVmNicNetworkPayload,
        //   this.changeVmNicNetworkService.actionFn,
        //   this.changeVmNicNetworkService
        // )

        // //修改网卡状态
        // runServiceFun(
        //   payload?.changeVmNicStatePayload,
        //   this.changeVmNicStateService.actionFn,
        //   this.changeVmNicStateService
        // )

        // //设置网卡静态ip
        // runServiceFun(
        //   payload?.setVmStaticIpPayload,
        //   this.setVmStaticIpService.actionFn,
        //   this.setVmStaticIpService
        // )
        // //删除网卡静态IP
        // runServiceFun(
        //   payload?.deleteVmStaticIpPayload,
        //   this.deleteVmStaticIpService.actionFn,
        //   this.deleteVmStaticIpService
        // )

        // //设置网卡qos
        // runServiceFun(
        //   payload?.setNicQosPayload,
        //   this.setNicQosService.actionFn,
        //   this.setNicQosService
        // )

        // //设置网卡MAC 地址
        // runServiceFun(
        //   payload?.updateVmNicMacPayload,
        //   this.updateVmNicMacService.actionFn,
        //   this.updateVmNicMacService
        // )

        // //网卡解绑安全组
        // runServiceFun(
        //   payload?.vmNicUnBindSecurityGroupPayload,
        //   this.vmNicUnBindSecurityGroupService.actionFn,
        //   this.updateVmNicMacService
        // )

        // //网卡绑定安全组
        // runServiceFun(
        //   payload?.vmNicBindSecurityGroupPayload,
        //   this.vmNicBindSecurityGroupService.actionFn,
        //   this.vmNicBindSecurityGroupService
        // )

        // //设置网卡型号
        // runServiceFun(
        //   payload?.updateVmNicDriverPayload,
        //   this.updateVmNicDriverService.actionFn,
        //   this.updateVmNicDriverService
        // )

        // systemTag: cpusocket
        runServiceFun(
          payload?.setSystemTagPayload,
          this.setSystemTagService.actionFn,
          this.setSystemTagService
        )

        // 标签
        runServiceFun(
          payload?.managementTagPayload,
          this.managementTagService.actionFn,
          this.managementTagService
        )

        await Promise.all(tasks)

        // // 加载ISO 带CD-ROM相关操作都进行后再执行 createVmCdRomPayload
        // if (payload?.createVmCdRomPayload?.length) {
        //   await Promise.all(
        //     payload?.createVmCdRomPayload.map(
        //       async payload =>
        //         await this.createVmCdRomService.actionFn.call(
        //           this.createVmCdRomService,
        //           payload,
        //           taskId,
        //           actionId
        //         )
        //     )
        //   )
        // }

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

        // // 加载云盘 需要串行调用，保证顺序
        // if (volumeAttachList?.length) {
        //   for (const item of _.sortBy(volumeAttachList, 'index')) {
        //     await item.fn()
        //   }
        // }
        // // usb操作

        // if (payload?.detachUsbDeviceToVmPayload?.length) {
        //   await Promise.all(
        //     payload?.detachUsbDeviceToVmPayload.map(
        //       async payload =>
        //         await this.detachUsbDeviceToVmService.actionFn.call(
        //           this.detachUsbDeviceToVmService,
        //           payload,
        //           taskId,
        //           actionId
        //         )
        //     )
        //   )
        // }
        // if (payload?.attachUsbDeviceToVmPayload) {
        //   await Promise.all(
        //     payload?.attachUsbDeviceToVmPayload.map(
        //       async payload =>
        //         await this.attachUsbDeviceToVmService.actionFn.call(
        //           this.attachUsbDeviceToVmService,
        //           payload,
        //           taskId,
        //           actionId
        //         )
        //     )
        //   )
        // }

        // if (payload.neeeReboot)
        //   await this.rebootVmInstanceAction.call(
        //     { uuid: payload.resourceUuid },
        //     { actionId, taskId }
        //   )

        return {
          id: payload.resourceUuid
        }
      },
      { resourceUuids: input.payload.map(item => item.resourceUuid) }
    )
    return { actionId }
  }
}
