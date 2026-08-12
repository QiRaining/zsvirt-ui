import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { HostKernelInterface } from '../host-kernel-interface.model'

@Injectable()
export class HostKernelInterfaceDataloader extends SimpleDataloaderFactory<HostKernelInterface>({
  tableName: 'HostKernelInterface'
}) {}
