import { Module } from '@nestjs/common'

import { CreateVmCdRomService } from './create-cdrom'
import { DeleteCdRomService } from './delete'
import { SetVmInstanceDefaultCdRomService } from './set-default'

@Module({
  providers: [DeleteCdRomService, SetVmInstanceDefaultCdRomService, CreateVmCdRomService],
  exports: [DeleteCdRomService, CreateVmCdRomService]
})
export class CdRomActionModule {}
