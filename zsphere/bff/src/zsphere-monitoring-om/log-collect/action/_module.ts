import { Module } from '@nestjs/common'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { AuditModule } from '@/maintenance/audit/audit.module'
import { LicenseModule } from '@/zsphere-administration/license/license.module'
import { OperationLogModule } from '@/zsphere-administration/operation-log/operation-log.module'

import { CancelLogCollectService } from './cancel'
import { CreateLogCollectService } from './create'
import { DeleteLogCollectService } from './delete'
import { ReCreateLogCollectService } from './recreate'

@Module({
  imports: [OperationLogModule, AuditModule, LicenseModule],
  providers: [
    ZStackApiBase,
    CreateLogCollectService,
    DeleteLogCollectService,
    ReCreateLogCollectService,
    CancelLogCollectService
  ],
  exports: []
})
export class LogCollectActionModule {}
