import { Module } from '@nestjs/common'

import { AuditService } from '@/maintenance/audit/audit.service'
import { VmInstanceQueryService } from '@/zsphere-resource/vm-instance/vm-instance-query/vm-instance-query.service'
import { AttachL3NetworkToVmNicService } from './attach-l3-network'
import { VmNicBindSecurityGroupService } from './bind-security-gourp'
import { DeleteVmStaticIpService } from './delete-static-ip'
import { UpdateVmNicDriverService } from './set-drive-type'
import { ChangeVmNicNetworkService } from './set-ip-address'
import { SetNicQosService } from './set-qos'
import { SetVmNicSecurityGroupService } from './set-security-group'
import { ChangeVmNicStateService } from './set-state'
import { SetVmStaticIpService } from './set-static-ip'
import { UpdateVmNetworkConfigService } from './sync-network-config'
import { VmNicUnBindSecurityGroupService } from './unbind-security-group'
import { UpdateVmNicMacService } from './update-mac'

@Module({
  providers: [
    UpdateVmNicMacService,
    SetVmStaticIpService,
    DeleteVmStaticIpService,
    SetNicQosService,
    AttachL3NetworkToVmNicService,
    UpdateVmNicDriverService,
    ChangeVmNicNetworkService,
    VmNicBindSecurityGroupService,
    VmNicUnBindSecurityGroupService,
    ChangeVmNicStateService,
    UpdateVmNetworkConfigService,
    VmInstanceQueryService,
    AuditService,
    SetVmNicSecurityGroupService
  ],
  exports: [
    UpdateVmNicMacService,
    SetVmStaticIpService,
    DeleteVmStaticIpService,
    SetNicQosService,
    AttachL3NetworkToVmNicService,
    UpdateVmNicDriverService,
    ChangeVmNicNetworkService,
    VmNicBindSecurityGroupService,
    VmNicUnBindSecurityGroupService,
    ChangeVmNicStateService,
    UpdateVmNetworkConfigService,
    VmInstanceQueryService
  ]
})
export class VmNicActionModule {}
