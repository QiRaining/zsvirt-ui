import { Module } from '@nestjs/common'

import { ResourceRelationsResolver } from './resource-relations.resolver'
import { ResoruceRelationsService } from './resource-relations.service'

@Module({
  providers: [ResourceRelationsResolver, ResoruceRelationsService]
})
export class ResourceRelationsModule {}
