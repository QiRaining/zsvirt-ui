import { Module } from '@nestjs/common'

import { ZceXTestConnectionAction } from '@/api/zstack/ZceXTestConnectionAction'

import { ZceXTestConnectionService } from './zcex-test-connection.service'

@Module({
  imports: [],
  providers: [ZceXTestConnectionService, ZceXTestConnectionAction],
  exports: [ZceXTestConnectionService]
})
export class ZceXTestConnectionModule {}
