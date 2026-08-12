import { Module } from '@nestjs/common'

import { AddSharedBlockToSharedBlockGroupService } from './add-shared-block'
import { RefreshSharedblockDeviceCapacityService } from './refresh-shared-block-device-capacity'

@Module({
  providers: [AddSharedBlockToSharedBlockGroupService, RefreshSharedblockDeviceCapacityService],
  exports: []
})
export class SharedBlockActionModule {}
