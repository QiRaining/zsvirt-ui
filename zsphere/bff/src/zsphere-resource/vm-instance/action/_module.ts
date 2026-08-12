import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { LongJobService } from '@/common/long-job/long-job.service'
import { SystemTagModule } from '@/common/system-tag/system-tag.module'
import { PciDeviceActionModule } from '@/hardware-resource/pci-device/action/_module'
import { ScsiLunActionModule } from '@/hardware-resource/scsi-lun/action'
import { TpmActionModule } from '@/hardware-resource/tpm/action/_module'
import { UsbDeviceActionModule } from '@/hardware-resource/usb-device/action/_module'
import { VGpuDeviceActionModule } from '@/hardware-resource/vgpu-device/action/_module'
import { AuditModule } from '@/maintenance/audit/audit.module'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { UpdateResourceConfigService } from '@/settings/resource-config/action/update-resource-config'
import { OperationLogActionModule } from '@/zsphere-administration/operation-log/action/_modules'
import { TagActionModule } from '@/zsphere-administration/tag/action/_module'
import { CdRomActionModule } from '@/zsphere-resource/cdroms/action/_modules'
import { VMDirectoryActionModule } from '@/zsphere-resource/vm-directory-group/action/_module'
import { AddResourcesToDirectoryService } from '@/zsphere-resource/vm-directory-group/action/add-resources-to-directory'
import { VmNicActionModule } from '@/zsphere-resource/vm-nic/action/_module'
import { SetVmNicSecurityGroupService } from '@/zsphere-resource/vm-nic/action/set-security-group'
import { UpdateVmNetworkConfigService } from '@/zsphere-resource/vm-nic/action/sync-network-config'
import { VolumeActionModule } from '@/zsphere-resource/volume/action/_module'

import { VmInstanceQueryService } from '../vm-instance-query/vm-instance-query.service'
import { AttachDataVolumeToVmService } from './attach-data-volume-to-vm'
import { AttachGuestToolsIsoToVmService } from './attach-guest-tools-iso-to-vm'
import { AttachIsoToVmInstanceService } from './attach-iso-to-vm-instance'
import { AttachVmToVmGroupService } from './attach-vm-to-vm-group'
import { ChangeVmImageService } from './change-vm-image'
import { ChangeVmPasswordService } from './change-vm-password'
import { CloneVmInstanceService } from './clone-vm-instance'
import { DeleteVmConsolePasswordService } from './delete-console-password'
import { DeleteVmSshKeyService } from './delete-ssh-key'
import { DeleteVmInstanceActionModule } from './delete-vm/_module'
import { DetachDataVolumeFromVmService } from './detach-data-volume-from-vm'
import { DetachGuestToolsIsoFromVmService } from './detach-guest-tools-iso-from-vm'
import { DetachIsoFromVmInstanceService } from './detach-iso-from-vm-instance'
import { DetachVmFromVmGroupService } from './detach-vm-from-vm-group'
import { EditGuestToolConfigService } from './edit-guest-tool-config'
import { EditNormalConfigService } from './edit-normal-config'
import { EditOtherConfigService } from './edit-other-config'
import { EditRemoteConfigService } from './edit-remote-config'
import { EditVmInstanceConfigService } from './edit-vm-config'
import { ExpungeVmInstanceService } from './expunge'
import { FlattenVmInstanceService } from './flatten-vm'
import { ForceStopVmInstanceService } from './force-stop'
import { LocalStorageMigrateVolumeService } from './migrate/local-storage-migrate-volume'
import { MigrateVmService } from './migrate/migrate-vm'
import { OpenConsoleService } from './open-console'
import { PauseVmInstanceService } from './pause'
import { PoweroffVmInstanceService } from './poweroff'
import { RebootVmInstanceService } from './reboot'
import { RecoverVmInstanceService } from './recover'
import { ReimageVmInstanceService } from './reimage'
import { RemoveHaStickStragedyService } from './remove-hastickstragedy'
import { ResizeRootVolumeService } from './resize-root-volume'
import { ResumeVmInstanceService } from './resume'
import { SetVmBIOSTrackService } from './set-bios-sync'
import { SetVmConsoleModeService } from './set-consle-mode'
import { SetVmConsolePasswordService } from './set-console-password'
import { SetVmEmulatorPinService } from './set-emulator-pin'
import { SetVmInstanceGpuDeviceSpecService } from './set-gpu-offering'
import { SetHaStickStragedyService } from './set-hastickstragedy'
import { SetVmHostnameService } from './set-hostname'
import { SetVmSshKeyService } from './set-ssk-key'
import { SetVmClockTrackService } from './set-time-sync'
import { SetVmUsbRedirectService } from './set-usb-redirect'
import { SetVmCleanTrafficService } from './set-vm-anti-spoofing'
import { SetVmBootModeService } from './set-vm-boot-mode'
import { SetVmBootVolumeService } from './set-vm-boot-volume'
import { SetVmBootOrderService } from './set-vm-bootorder'
import { SetVmDnsService } from './set-vm-dns'
import { SetVmHaLevelService } from './set-vm-ha'
import { SetVmMonitorNumberService } from './set-vm-monitor'
import { StartVmInstanceFromHostService } from './start-vm-from-host'
import { StartVmInstanceService } from './start-vm-instance'
import { StopVmInstanceService } from './stop-vm-instance'
import { StorageMigratepVmInstanceService } from './storage-migrate'
import { UpdateVmInstanceService } from './update-vm-instance'
import { UpdateVmPriorityService } from './update-vm-priority'
import { CreateInstanceService } from './zsv/create-instance'
import { CreateInstanceFromOvfService, ExportOvfService } from './zsv/create-instance-from-ovf'
import { DeleteExportedOvfService } from './zsv/delete-exported-ovf'
import { RegisterVmInstanceService } from './zsv/register-vm-instance'
import { CloneVmToTemplateService } from './zsv/template/clone-way'
import { VMConverToTemplateService } from './zsv/template/conver-way'
import { CreateVmFromVMTemplateService } from './zsv/template/create-instance-base-on-template'

@Module({
  imports: [
    DeleteVmInstanceActionModule,
    AuditModule,
    SequelizeModule.forFeature([ZsLongJob]),
    OperationLogActionModule,
    PciDeviceActionModule,
    VGpuDeviceActionModule,
    VolumeActionModule,
    VmNicActionModule,
    TagActionModule,
    SystemTagModule,
    CdRomActionModule,
    UsbDeviceActionModule,
    TpmActionModule,
    VMDirectoryActionModule,
    ScsiLunActionModule
  ],
  providers: [
    CreateVmFromVMTemplateService,
    UpdateResourceConfigService,
    EditNormalConfigService,
    StartVmInstanceService,
    StopVmInstanceService,
    UpdateVmInstanceService,
    PauseVmInstanceService,
    RecoverVmInstanceService,
    ResumeVmInstanceService,
    RebootVmInstanceService,
    RemoveHaStickStragedyService,
    SetHaStickStragedyService,
    UpdateVmPriorityService,
    SetVmConsoleModeService,
    PoweroffVmInstanceService,
    SetVmInstanceGpuDeviceSpecService,
    ResizeRootVolumeService,
    ChangeVmImageService,
    AttachDataVolumeToVmService,
    DetachDataVolumeFromVmService,
    AttachIsoToVmInstanceService,
    DetachIsoFromVmInstanceService,
    DetachGuestToolsIsoFromVmService,
    SetVmUsbRedirectService,
    ChangeVmPasswordService,
    AttachVmToVmGroupService,
    DetachVmFromVmGroupService,
    StorageMigratepVmInstanceService,
    LongJobService,
    DeleteVmSshKeyService,
    SetVmSshKeyService,
    DeleteVmConsolePasswordService,
    SetVmConsolePasswordService,
    ReimageVmInstanceService,
    ExpungeVmInstanceService,
    StartVmInstanceFromHostService,
    SetVmBootOrderService,
    LocalStorageMigrateVolumeService,
    MigrateVmService,
    SetVmHaLevelService,
    CloneVmInstanceService,
    SetVmCleanTrafficService,
    SetVmBootModeService,
    OpenConsoleService,
    SetVmMonitorNumberService,
    AttachGuestToolsIsoToVmService,
    SetVmClockTrackService,
    SetVmBIOSTrackService,
    SetVmBootVolumeService,
    ForceStopVmInstanceService,
    SetVmEmulatorPinService,
    VmInstanceQueryService,
    SetVmHostnameService,
    SetVmDnsService,
    UpdateVmNetworkConfigService,
    FlattenVmInstanceService,
    CreateInstanceService,
    EditVmInstanceConfigService,
    EditGuestToolConfigService,
    EditOtherConfigService,
    EditRemoteConfigService,
    SetVmNicSecurityGroupService,
    AddResourcesToDirectoryService,
    CreateInstanceFromOvfService,
    ExportOvfService,
    DeleteExportedOvfService,
    VMConverToTemplateService,
    CloneVmToTemplateService,
    RegisterVmInstanceService
  ]
})
export class VMActionModule {}
