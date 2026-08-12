import { Module } from '@nestjs/common'

import { AddPreconfigurationTemplateService } from './add-preconfiguration-template'
import { ChangePreconfigurationTemplateStateService } from './change-preconfiguration-template-state'
import { DeletePreconfigurationTemplateService } from './delete-preconfiguration-template'
import { UpdatePreconfigurationTemplateService } from './update-preconfiguration-template'

@Module({
  providers: [
    ChangePreconfigurationTemplateStateService,
    AddPreconfigurationTemplateService,
    DeletePreconfigurationTemplateService,
    UpdatePreconfigurationTemplateService
  ],
  exports: []
})
export class PreconfigurationTemplateActionModule {}
