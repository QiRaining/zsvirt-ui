import { Module } from '@nestjs/common'

import { LongJobService } from '@/common/long-job/long-job.service'

import { AddKVMHostService } from './add-kvm-host'
import { AddKVMHostFromConfigFileService } from './add-kvm-host-from-configfile'
import { AddKVMHostFromScanService } from './add-kvm-host-from-scan'
import { AddXDragonHostService } from './add-xdragon-host'
import { ExpandSdsAction } from './ExpandSdsAction'

@Module({
  providers: [
    LongJobService,
    AddKVMHostService,
    AddXDragonHostService,
    AddKVMHostFromConfigFileService,
    AddKVMHostFromScanService,
    ExpandSdsAction
  ],
  exports: []
})
export class HostCreateModule {}
