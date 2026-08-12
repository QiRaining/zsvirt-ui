import { Module } from '@nestjs/common'

import { AttachNvmeServerToClusterService } from './attach-nvme-server-to-cluster'
import { AddNvmeServerService } from './create'
import { DeleteNvmeServerService } from './delete-nvme-server'
import { DetachNvmeServerFromClusterService } from './detach-nvme-server-to-cluster'
import { RefreshNvmeServerService } from './refresh-nvme-server'
import { UpdateNvmeServerService } from './update-nvme-server'

@Module({
  providers: [
    UpdateNvmeServerService,
    DeleteNvmeServerService,
    RefreshNvmeServerService,
    AttachNvmeServerToClusterService,
    DetachNvmeServerFromClusterService,
    AddNvmeServerService
  ],
  exports: []
})
export class NvmeServerServiceActionModule {}
