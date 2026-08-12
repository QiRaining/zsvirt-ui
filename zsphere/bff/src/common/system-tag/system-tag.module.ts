import { Global, Module } from '@nestjs/common'

import { SetSystemTagService } from './set-system-tag'
import { SystemTagDataloader } from './system-tag.dataloader'

@Global()
@Module({
  providers: [SystemTagDataloader, SetSystemTagService],
  exports: [SystemTagDataloader, SetSystemTagService]
})
export class SystemTagModule {}
