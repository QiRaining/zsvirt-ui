import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { PhysicalNic } from './pci-device.model'

@Injectable()
export class HostNetworkInterfaceDataloader extends SimpleDataloaderFactory<PhysicalNic>({
  tableName: 'HostNetworkInterface'
}) {}
