import { Module } from '@nestjs/common'

import { CancelActionController } from './cancel-action'
import { CancelLongjobService, CancelLongjobHelperService } from './cancel-long-job'

@Module({
  providers: [CancelLongjobService, CancelLongjobHelperService],
  exports: [CancelLongjobHelperService],
  controllers: [CancelActionController]
})
export class OperationLogActionModule {}
