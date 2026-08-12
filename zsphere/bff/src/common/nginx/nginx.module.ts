import { Module, Global } from '@nestjs/common'

import { NginxService } from './nginx.service'

@Global()
@Module({
  providers: [NginxService],
  exports: [NginxService]
})
export class NginxModule {}
