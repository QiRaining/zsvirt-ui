import { Module } from '@nestjs/common'

import { AddGroupService } from './add-group'
import { AddResourcesToDirectoryService } from './add-resources-to-directory'
import { DeleteGroupService } from './delete-group'
import { UpdateGroupService } from './update-group'

@Module({
  providers: [
    AddResourcesToDirectoryService,
    AddGroupService,
    DeleteGroupService,
    UpdateGroupService
  ],
  exports: []
})
export class VMDirectoryActionModule {}
