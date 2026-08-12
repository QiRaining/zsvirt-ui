import { Injectable, Inject } from '@nestjs/common'

import { DeletePciDeviceAction } from '@/api/zstack/DeletePciDeviceAction'
import { UpdatePciDeviceAction } from '@/api/zstack/UpdatePciDeviceAction'
import { ActionService } from '@/base/action-service'

// import { UpdatePciDeviceInput as IUpdatePciDeviceInput } from '@/hardware-resource/pci-device/pci-device.model'

@Injectable()
export class PciDevicService extends ActionService {
  @Inject() updatePciDeviceAction: UpdatePciDeviceAction
  @Inject() deletePciDeviceAction: DeletePciDeviceAction
}
