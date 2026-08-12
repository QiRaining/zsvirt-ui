import { Module, Global } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsFlow } from '../../model/zs-flow.model'
import { ActionHandlerService } from './flow-handler/action-handler.service'
import { FlowInstanceService } from './flow-instance/flow-instance.service'
import { FlowManagerService } from './flow-manager/flow-manager.service'

@Global()
@Module({
  imports: [SequelizeModule.forFeature([ZsFlow])],
  providers: [FlowInstanceService, FlowManagerService, ActionHandlerService],
  exports: [FlowInstanceService, FlowManagerService, ActionHandlerService]
})
export class FlowModule {}
