import { Module } from '@nestjs/common'

import { AddSNSWeComAtPersonService } from './add-wecom-at-person'
import { RemoveSNSWeComAtPersonService } from './remove-wecom-at-person'
import { UpdateSNSWeComAtPersonService } from './update-wecom-at-person'

@Module({
  providers: [
    AddSNSWeComAtPersonService,
    RemoveSNSWeComAtPersonService,
    UpdateSNSWeComAtPersonService
  ]
})
export class SNSWeComAtPersonActionModule {}
