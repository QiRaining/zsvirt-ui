import { Module } from '@nestjs/common'

import { AddCephMonService } from './add-ceph-mon'
import { DeleteCephMonService } from './delete-ceph-mon'
import { UpdateCephMonService } from './update-ceph-mon'

@Module({
  providers: [AddCephMonService, UpdateCephMonService, DeleteCephMonService],
  exports: []
})
export class CephMonActionModule {}
