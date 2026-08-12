import { Module } from '@nestjs/common'

import { CreateEmailServerSettingService } from './create-email-server-setting'
import { DeleteEmailServerSettingService } from './delete-email-server-setting'
import { DisableEmailServerService } from './disable-email-server-setting'
import { EnableEmailServerService } from './enable-email-server-setting'
import { UpdateEmailServerSettingService } from './update-email-server-setting'
import { ValidateEmailServerSettingService } from './validate-email-server-setting'

@Module({
  providers: [
    CreateEmailServerSettingService,
    DeleteEmailServerSettingService,
    UpdateEmailServerSettingService,
    ValidateEmailServerSettingService,
    DisableEmailServerService,
    EnableEmailServerService
  ],
  exports: []
})
export class EmailServerSettingActionModule {}
