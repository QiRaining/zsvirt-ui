import { Module } from '@nestjs/common'

import { CreateVmCustomSpecificationService } from './create'
import { DeleteVmCustomSpecificationService } from './delete'
import { UpdateVmCustomSpecificationService } from './update'

@Module({
  providers: [
    CreateVmCustomSpecificationService,
    UpdateVmCustomSpecificationService,
    DeleteVmCustomSpecificationService
  ]
})
export class VmSpecActionModule {}
