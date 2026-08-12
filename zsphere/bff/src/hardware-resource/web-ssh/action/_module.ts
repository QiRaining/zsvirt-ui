import { Module } from '@nestjs/common'

import { GetHostWebSshUrlService } from './get-host-web-ssh-url'

@Module({
  providers: [GetHostWebSshUrlService],
  exports: []
})
export class WebSshActionModule {}
