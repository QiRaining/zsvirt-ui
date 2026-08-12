import { Module } from '@nestjs/common'

import { TagActionModule } from '@/zsphere-administration/tag/action/_module'
import { ResizeRootVolumeService } from '@/zsphere-resource/vm-instance/action/resize-root-volume'
import { UpdateVmPriorityService } from '@/zsphere-resource/vm-instance/action/update-vm-priority'
import { VolumeActionModule } from '@/zsphere-resource/volume/action/_module'

import { ConverTemplateToVMService } from './conver-to-vm'
import { DeleteVmTemplateService } from './delete'
import { EditVmTemplateConfigService } from './edit-config'
import { UpdateVmTemplateService } from './update'

@Module({
  imports: [
    TagActionModule,
    VolumeActionModule

    // DeleteVmInstanceActionModule,
    // AuditModule,
    // SequelizeModule.forFeature([ZsLongJob]),
    // OperationLogActionModule,
    // PciDeviceActionModule,
    // VGpuDeviceActionModule,
    // VolumeActionModule,
    // VmNicActionModule,
    // TagActionModule,
    // SystemTagModule,
    // CdRomActionModule,
    // UsbDeviceActionModule,
    // VMDirectoryActionModule,
    // ScsiLunActionModule
  ],
  providers: [
    DeleteVmTemplateService,
    ConverTemplateToVMService,
    UpdateVmTemplateService,
    EditVmTemplateConfigService,
    //编辑模版
    UpdateVmPriorityService,
    ResizeRootVolumeService
  ],
  exports: []
})
export class VmTemplateActionModule {}
