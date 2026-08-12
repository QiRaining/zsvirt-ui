import { Module } from '@nestjs/common'

import { CancelDefaultSNSTextTemplateService } from './cancel-default'
import { CreateSNSTextTemplateService } from './create'
import { CreateAliyunSmsSNSTextTemplateService } from './create-aliyun-sms'
import { DeleteSNSTextTemplateService } from './delete'
import { SetDefaultSNSTextTemplateService } from './set-default'
import { UpdateSNSTextTemplateService } from './update'
import { UpdateAliyunSmsSNSTextTemplateService } from './update-aliyun-sms'

@Module({
  providers: [
    CreateAliyunSmsSNSTextTemplateService,
    UpdateAliyunSmsSNSTextTemplateService,
    CreateSNSTextTemplateService,
    UpdateSNSTextTemplateService,
    DeleteSNSTextTemplateService,
    SetDefaultSNSTextTemplateService,
    CancelDefaultSNSTextTemplateService
  ]
})
export class SNSTextTemplateActionModule {}
