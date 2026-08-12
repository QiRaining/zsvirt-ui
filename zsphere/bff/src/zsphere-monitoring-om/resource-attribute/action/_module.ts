import { Module } from '@nestjs/common'

import { CreateResourceAttributeKeyService } from './create-key'
import { DeleteResourceAttributeKeyService } from './delete-key'
import { SetResourceAttributeValueService } from './set-value'
import { UpdateResourceAttributeKeyService } from './update-key'

@Module({
  providers: [
    CreateResourceAttributeKeyService,
    UpdateResourceAttributeKeyService,
    DeleteResourceAttributeKeyService,
    SetResourceAttributeValueService
  ]
})
export class ResourceAttributeActionModule {}
