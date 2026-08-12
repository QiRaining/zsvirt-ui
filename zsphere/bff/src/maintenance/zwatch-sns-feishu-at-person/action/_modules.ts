import { Module } from '@nestjs/common'

import { AddSNSFeiShuAtPersonService } from './add-feishu-at-person'
import { RemoveSNSFeiShuAtPersonService } from './remove-feishu-at-person'
import { UpdateSNSFeiShuAtPersonService } from './update-feishu-at-person'

@Module({
  providers: [
    AddSNSFeiShuAtPersonService,
    RemoveSNSFeiShuAtPersonService,
    UpdateSNSFeiShuAtPersonService
  ]
})
export class SNSFeiShuAtPersonActionModule {}
