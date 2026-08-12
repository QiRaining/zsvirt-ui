import { Module } from '@nestjs/common'

import { CreateLogServerService } from './create-log-server'
import { DeleteLogServerService } from './delete-log-server'
import { TestLogServerService } from './test-log-server'
import { UpdateLogServerService } from './update-log-server'

@Module({
  providers: [
    CreateLogServerService,
    DeleteLogServerService,
    TestLogServerService,
    UpdateLogServerService
  ],
  exports: []
})
export class LogServerActionModule {}
