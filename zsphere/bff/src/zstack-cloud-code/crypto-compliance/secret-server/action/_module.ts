import { Module } from '@nestjs/common'

import { AddSecretServerService } from './create'

@Module({
  imports: [],
  providers: [AddSecretServerService],
  exports: []
})
export class SecretServerActionModule {}
