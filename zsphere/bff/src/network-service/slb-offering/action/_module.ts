import { Module } from '@nestjs/common'

import { ChangeSlbOfferingStateService } from './chang-instance-offering-state'
import { CreateSlbOfferingService } from './create/create-slb-offering.service'
import { UpdateSlbOfferingService } from './update-instance-offering'

@Module({
  providers: [CreateSlbOfferingService, ChangeSlbOfferingStateService, UpdateSlbOfferingService]
})
export class SlbOfferingActionModule {}
