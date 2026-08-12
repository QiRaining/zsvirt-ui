import { Module } from '@nestjs/common'

import { XmlHookActionModule } from './action/_module'
import { XmlHookDataloader } from './xml-hook.dataloader'
import { XmlHookResolver } from './xml-hook.resolver'
import { XmlHookService } from './xml-hook.service'

@Module({
  imports: [XmlHookActionModule],
  providers: [XmlHookResolver, XmlHookService, XmlHookDataloader],
  exports: [XmlHookDataloader]
})
export class XmlHookModule {}
