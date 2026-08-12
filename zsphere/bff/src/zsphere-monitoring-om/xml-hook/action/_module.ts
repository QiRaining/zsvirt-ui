import { Module } from '@nestjs/common'

import { AttachXmlHookToVmService } from './attach-vm'
import { CreateXmlHookService } from './create'
import { DeleteXmlHookService } from './delete'
import { DetachXmlHookFromVmService } from './detach-vm'
import { UpdateXmlHookService } from './update'

@Module({
  providers: [
    CreateXmlHookService,
    DeleteXmlHookService,
    UpdateXmlHookService,
    AttachXmlHookToVmService,
    DetachXmlHookFromVmService
  ],
  exports: []
})
export class XmlHookActionModule {}
