import { Module } from '@nestjs/common'

import { AddDnsToL3NetworkService } from './add-dns'
import { CreateL3NetworkActionService } from './create-l3-network'
import { AddDnsTaskService } from './create/add-dns-task.service'
import { AddIpRangeTaskService } from './create/add-ip-range-task.service'
import { AttachVpcRouterTaskService } from './create/attach-vpc-router'
import { DeleteL3NetworkService } from './delete-l3-network'
import { DetachL3NetworkFromVmService } from './detach-vpc-router'
import { EditL3NetworkConfigService } from './edit-config'
import { RemoveDnsFromL3NetworkService } from './remove-dns'
import { UpdateL3NetworkService } from './update'

@Module({
  providers: [
    AddDnsToL3NetworkService,
    RemoveDnsFromL3NetworkService,
    DeleteL3NetworkService,
    CreateL3NetworkActionService,
    // CreateL3NetworkTaskService,
    // AttachVirtualRouterOfferingTaskService,

    AddIpRangeTaskService,
    AddDnsTaskService,
    AttachVpcRouterTaskService,
    // CreateL3NetworkTaskHandlerService,
    // SetInterfaceIpTaskService,
    DetachL3NetworkFromVmService,
    UpdateL3NetworkService,
    EditL3NetworkConfigService
  ],
  exports: [
    AddDnsToL3NetworkService,
    RemoveDnsFromL3NetworkService,

    AddDnsTaskService,
    AttachVpcRouterTaskService,
    AddIpRangeTaskService,
    DeleteL3NetworkService,
    UpdateL3NetworkService,
    CreateL3NetworkActionService
  ]
})
export class L3NetworkActionModule {}
