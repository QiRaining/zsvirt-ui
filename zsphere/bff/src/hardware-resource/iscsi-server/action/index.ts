import { Module } from '@nestjs/common'

import { AttachIscsiServerToClusterService } from './attach-iscsi-server-to-cluster'
import { DeleteIscsiServerService } from './delete-iscsi-server'
import { DetachIscsiServerFromClusterService } from './detach-iscsi-server-to-cluster'
import { RefreshIscsiServerService } from './refresh-iscsi-server'
import { UpdateIscsiServerService } from './update-iscsi-server'

@Module({
  providers: [
    UpdateIscsiServerService,
    DeleteIscsiServerService,
    RefreshIscsiServerService,
    AttachIscsiServerToClusterService,
    DetachIscsiServerFromClusterService
  ],
  exports: []
})
export class IscsiServerServiceActionModule {}
