import { Global, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsResumableUploadSession } from './resumable-upload-session.model'
import { ZopsLongJob } from './zops-long-job.model'
import { ZsActionApi } from './zs-action-api.model'
import { ZsActionTask } from './zs-action-task.model'
import { ZsAction } from './zs-action.model'
import { ZsEvent } from './zs-event.model'
import { ZsFlow } from './zs-flow.model'
import { ZsKv } from './zs-kv.model'
import { ZsLogCollect } from './zs-log-collect.model'
import { ZsLongJob } from './zs-long-job.model'
import { ZsProfile } from './zs-profile.model'
import { ZsRolePrivilege } from './zs-role-privilege.model'
import { ZsSession } from './zs-session.model'
import { ZsUIConfig } from './zs-ui-config.model'

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([
      ZsUIConfig,
      ZsEvent,
      ZsFlow,
      ZsKv,
      ZsLongJob,
      ZsSession,
      ZsAction,
      ZsActionTask,
      ZsActionApi,
      ZsRolePrivilege,
      ZsProfile,
      ZsResumableUploadSession,

      ZopsLongJob,
      ZsLogCollect
    ])
  ],
  exports: [SequelizeModule]
})
export class ModelModule {}

export const models = [
  ZsUIConfig,
  ZsEvent,
  ZsFlow,
  ZsKv,
  ZsLongJob,
  ZsSession,
  ZsAction,
  ZsActionTask,
  ZsActionApi,
  ZsRolePrivilege,
  ZsProfile,
  ZsResumableUploadSession,
  ZopsLongJob,
  ZsLogCollect
]
