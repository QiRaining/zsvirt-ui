import { Global, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { RecordActionModule } from '@/common/record-action/record-action.module'
import { ZsActionTask } from '@/model/zs-action-task.model'
import { ZsAction } from '@/model/zs-action.model'

import { ActionManagerService } from './action-manager'

@Global()
@Module({
  providers: [ActionManagerService, ZStackApiBase],
  exports: [ActionManagerService],
  imports: [RecordActionModule, SequelizeModule.forFeature([ZsAction, ZsActionTask])]
})
export class ActionManagerModule {}
