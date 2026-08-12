import { Module } from '@nestjs/common'
import { AddThirdPartyAuthService } from './add-thirdparty-auth'

@Module({
  providers: [AddThirdPartyAuthService],
  exports: []
})
export class ThirdPartyAuthCreateModule {}
