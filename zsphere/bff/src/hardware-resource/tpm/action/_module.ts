import { Module } from '@nestjs/common'

import { AddTpmToVmService } from './add-tpm-to-vm'
import { RemoveTpmFromVmService } from './remove-tpm-from-vm'
import { UpdateTpmService } from './update-tpm'

@Module({
  providers: [AddTpmToVmService, RemoveTpmFromVmService, UpdateTpmService],
  exports: [AddTpmToVmService, RemoveTpmFromVmService, UpdateTpmService]
})
export class TpmActionModule {}
