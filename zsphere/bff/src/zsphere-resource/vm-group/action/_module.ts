import { Module } from '@nestjs/common'

import { AddVmToVmGroupService } from './add-vm'
import { CreateVmGroupService } from './create'
import { DeleteVmGroupService } from './delete'
import { RemoveVmFromVmGroupService } from './remove-vm'
import { UpdateVmGroupService } from './update'

@Module({
  providers: [
    CreateVmGroupService,
    DeleteVmGroupService,
    UpdateVmGroupService,
    AddVmToVmGroupService,
    RemoveVmFromVmGroupService
  ],
  exports: []
})
export class VmGroupActionModule {}
