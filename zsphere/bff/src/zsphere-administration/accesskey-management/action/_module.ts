import { Module } from '@nestjs/common'

import { ChangeAccessKeyStateService } from './change-accesskey-state'
import { CreateAccessKeyService } from './create-accesskey'
import { DeleteAccessKeyService } from './delete-accesskey'

@Module({
  providers: [
    CreateAccessKeyService,
    ChangeAccessKeyStateService,
    DeleteAccessKeyService,
  ],
  exports: []
})
export class AccessKeyActionModule {}
