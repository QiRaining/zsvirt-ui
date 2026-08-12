import { Module } from '@nestjs/common'

import { AuditModule } from '@/maintenance/audit/audit.module'

import { DataExportController } from './data-export.controller'
import { DataExportResolver } from './data-export.resolver'
import { DataExportService } from './data-export.service'
@Module({
  imports: [AuditModule],
  exports: [],
  providers: [DataExportService, DataExportResolver],
  controllers: [DataExportController]
})
export class DataExportModule {}
