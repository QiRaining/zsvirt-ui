import { Module } from '@nestjs/common'

import { AddHostToHostGroupService } from './add-host'
import { CreateHostGroupService } from './create'
import { DeleteHostGroupService } from './delete'
import { RemoveHostFromHostGroupService } from './remove-host'
import { UpdateHostGroupService } from './update'

@Module({
  providers: [
    CreateHostGroupService,
    DeleteHostGroupService,
    UpdateHostGroupService,
    AddHostToHostGroupService,
    RemoveHostFromHostGroupService
  ],
  exports: []
})
export class HostGroupActionModule {}
