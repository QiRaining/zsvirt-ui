import { Global, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { RecordActionService } from '@/common/record-action/record-action.service'
import { ZsActionTask } from '@/model/zs-action-task.model'
import { ZsAction } from '@/model/zs-action.model'

import { RecordActionServiceBase } from './record-action-base.service'

@Global()
@Module({
  imports: [SequelizeModule.forFeature([ZsAction, ZsActionTask])],
  providers: [RecordActionServiceBase, RecordActionService],
  exports: [RecordActionServiceBase, RecordActionService]
})
export class RecordActionModule {}
