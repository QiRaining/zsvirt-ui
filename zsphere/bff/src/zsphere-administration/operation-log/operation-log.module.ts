import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { AuditModule } from '@/maintenance/audit/audit.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { OperationLogActionModule } from './action/_modules'
import {
  OperationApiResolver,
  OperationLogResolver,
  OperationLogLongJobResolver
} from './operation-log.resolver'
import { OperationLogService } from './operation-log.service'

@Module({
  imports: [
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    OperationLogActionModule,
    AuditModule
  ],
  providers: [
    OperationLogService,
    OperationLogResolver,
    OperationApiResolver,
    OperationLogLongJobResolver
  ],
  exports: [
    OperationLogService,
    OperationLogResolver,
    OperationApiResolver,
    OperationLogLongJobResolver
  ]
})
export class OperationLogModule {}
