import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'
import { ZOp } from '@/common/zql'

import { PciDevice } from '../pci-device.model'

@Injectable()
export class PciDeviceForPhysicalNicDataloader extends SimpleDataloaderFactory<PciDevice>({
  tableName: 'PciDevice',
  getCondition: uuid => ({
    hostUuid: {
      [ZOp.eq]: {
        [ZOp.query]: {
          tableName: 'HostNetworkInterface.hostUuid',
          condition: {
            uuid
          }
        }
      }
    },
    pciDeviceAddress: {
      [ZOp.eq]: {
        [ZOp.query]: {
          tableName: 'HostNetworkInterface.pciDeviceAddress',
          condition: {
            uuid
          }
        }
      }
    },
    virtStatus: {
      [ZOp.ne]: 'SRIOV_VIRTUAL'
    },
    type: {
      [ZOp.in]: ['Ethernet_Controller']
    }
  })
}) {}
