import { Module } from '@nestjs/common'

import { BatchCreateHostKernelInterfaceService } from './batch-create'
import { CreateHostKernelInterfaceService } from './create'
import { DeleteHostKernelInterfaceService } from './delete'
import { UpdateHostKernelInterfaceService } from './update'

@Module({
  imports: [],
  providers: [
    CreateHostKernelInterfaceService,
    BatchCreateHostKernelInterfaceService,
    UpdateHostKernelInterfaceService,
    DeleteHostKernelInterfaceService
  ],
  exports: []
})
export class HostKernelInterfaceActionModule {}
