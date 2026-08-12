import { Module } from '@nestjs/common'

import { LongJobService } from '@/common/long-job/long-job.service'

import { CreateBaremetalChassisService } from './create-baremetal-chassis'
import { DeleteBaremetalChassisService } from './delete-baremetal-chassis'
import { InspectBaremetalChassisService } from './inspect-baremetal-chassis'
import { UpdateBaremetalChassisService } from './update-baremetal-chassis'

@Module({
  providers: [
    LongJobService,
    InspectBaremetalChassisService,
    CreateBaremetalChassisService,
    DeleteBaremetalChassisService,
    UpdateBaremetalChassisService
  ],
  exports: []
})
export class BaremetalChassisActionModule {}
