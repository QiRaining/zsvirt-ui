import { Module } from '@nestjs/common'

import { UIEnvResolver } from './ui-env.resolver'
import { UIEnvService } from './ui-env.service'

@Module({
  providers: [UIEnvService, UIEnvResolver]
})
export class UIEnvModule {}
