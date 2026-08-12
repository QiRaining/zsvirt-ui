import { Module } from '@nestjs/common'

import { AddNicService } from './add-nic'
import { CreateBondService } from './create'
import { DeleteBondService } from './delete'
import { DetachL2NetworkFromHostService } from './detach-l2network-from-host'
import { EditBondService } from './edit'
import { RemoveNicService } from './remove-nic'
import { SetIpOnBondService } from './set-ip'

@Module({
  providers: [
    CreateBondService,
    DeleteBondService,
    SetIpOnBondService,
    EditBondService,
    AddNicService,
    RemoveNicService,
    DetachL2NetworkFromHostService
  ],
  exports: [
    CreateBondService,
    DeleteBondService,
    SetIpOnBondService,
    EditBondService,
    AddNicService,
    RemoveNicService,
    DetachL2NetworkFromHostService
  ]
})
export class BondActionModule {}
