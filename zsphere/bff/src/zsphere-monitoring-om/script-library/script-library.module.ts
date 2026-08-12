import { Module } from '@nestjs/common'

import { FlowModule } from '@/common/flow/flow.module'

import { ScriptActionModule } from './action/_module'
import { QueryGuestVmScriptExecutedRecordDetailService } from './query/vm-script-executed-record-detail.service'
import { QueryGuestVmScriptExecutedRecordService } from './query/vm-script-executed-record.service'
import { QueryGuestVmScriptService } from './query/vm-script.service'
import {
  ScriptLibraryResolver,
  ScriptRecordResolver,
  ScriptRecordDetailResolver
} from './script-library.resolver'
import { ScriptDataloader } from './script.dataloader'

@Module({
  imports: [FlowModule, ScriptActionModule],
  providers: [
    QueryGuestVmScriptService,
    QueryGuestVmScriptExecutedRecordService,
    QueryGuestVmScriptExecutedRecordDetailService,
    ScriptLibraryResolver,
    ScriptRecordResolver,
    ScriptRecordDetailResolver,
    ScriptDataloader
  ]
})
export class ScriptLibraryModule {}
