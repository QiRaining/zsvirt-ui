import { Module } from '@nestjs/common'

import { CreateScriptService } from './create-script'
import { DeleteScriptService } from './delete-script'
import { ExecuteScriptService } from './execute-script'
import { UpdateScriptService } from './update-script'
@Module({
  providers: [CreateScriptService, DeleteScriptService, ExecuteScriptService, UpdateScriptService],
  exports: []
})
export class ScriptActionModule {}
