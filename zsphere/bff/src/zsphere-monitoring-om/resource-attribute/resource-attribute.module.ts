import { Module } from '@nestjs/common'

import { ResourceAttributeActionModule } from './action/_module'
import {
  ResourceAttributeConstraintResolver,
  ResourceAttributeKeyResolver,
  ResourceAttributeValueResolver
} from './resource-attribute.resolver'
import { ResourceAttributeService } from './resource-attribute.service'

@Module({
  imports: [ResourceAttributeActionModule],
  providers: [
    ResourceAttributeConstraintResolver,
    ResourceAttributeKeyResolver,
    ResourceAttributeValueResolver,
    ResourceAttributeService
  ],
  exports: [ResourceAttributeService]
})
export class ResourceAttributeModule {}
