import { Module } from '@nestjs/common'

import { UpdateThirdpartyPlatformService } from './update'

@Module({
  providers: [UpdateThirdpartyPlatformService],
  exports: []
})
export class ThirdpartyPlatformActionModule {}
