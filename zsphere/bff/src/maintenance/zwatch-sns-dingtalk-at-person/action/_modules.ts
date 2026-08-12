import { Module } from '@nestjs/common'

import { AddSNSDingTalkAtPersonService } from './add-dingtalk-at-person'
import { RemoveSNSDingTalkAtPersonService } from './remove-dingtalk-at-person'
import { UpdateSNSDingTalkAtPersonService } from './update-dingtalk-at-person'

@Module({
  providers: [
    AddSNSDingTalkAtPersonService,
    RemoveSNSDingTalkAtPersonService,
    UpdateSNSDingTalkAtPersonService
  ]
})
export class SNSDingTalkAtPersonActionModule {}
