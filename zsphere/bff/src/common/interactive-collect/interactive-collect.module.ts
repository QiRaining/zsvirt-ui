import { Module } from '@nestjs/common'

import { InteractiveCollectResolver } from './interactive-collect.resolver'
import { InteractiveCollectQueryService } from './interactive-collect.service'

@Module({
  controllers: [],
  providers: [InteractiveCollectResolver, InteractiveCollectQueryService]
})
export class InteractiveCollectModule {}
