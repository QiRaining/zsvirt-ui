import { Module } from '@nestjs/common'

import { AttachTagService } from './attach-tag'
import { CreateTagService } from './create-tag'
import { DeleteTagService } from './delete-tag'
import { DetachTagService } from './detach-tag'
import { ManagementTagService } from './management-tag'
import { UpdateTagService } from './update-tag'

@Module({
  providers: [
    DeleteTagService,
    CreateTagService,
    DetachTagService,
    AttachTagService,
    UpdateTagService,
    ManagementTagService
  ],
  exports: [ManagementTagService]
})
export class TagActionModule {}
