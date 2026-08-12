import { Module } from '@nestjs/common'

// import { AddIscsiServerActionHandlerService } from './add-iscsi-server/add-iscsi-server-action-handler.service'
import { IscsiServerServiceActionModule } from './action'
// import { AddIscsiServerTaskService } from './add-iscsi-server/add-iscsi-server-task.service'
// import { AttachIscsiServerToClusterTaskService } from './add-iscsi-server/attach-iscsi-server-to-cluster-task.service'
// import { AddIscsiServerTaskHandlerService } from './add-iscsi-server/add-iscsi-server-task-handler.service'
import { AddIscsiServerService } from './add-iscsi-server/add-iscsi-server.service'
import { IscsiServerQueryService } from './iscsi-server-query/iscsi-server-query.service'
import { IscsiServerResolver, IscsiTargetResolver } from './iscsi-server.resolver'

@Module({
  imports: [IscsiServerServiceActionModule],
  providers: [
    IscsiServerResolver,
    IscsiTargetResolver,
    IscsiServerQueryService,
    AddIscsiServerService
  ]
})
export class IscsiServerModule {}
