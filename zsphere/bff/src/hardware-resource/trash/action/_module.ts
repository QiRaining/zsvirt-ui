import { Module } from '@nestjs/common'

import { CleanUpTrashService } from './clean-up-trash'

@Module({
  providers: [CleanUpTrashService],
  exports: []
})
export class CleanUpTrashActionModule {}
