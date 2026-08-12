import { Module } from '@nestjs/common'

import { CreateSnmpAgentService } from './create-snmp-agent'
import { CreateSnmpTrapReceiverService } from './create-snmp-trap'
import { DeleteSnmpTrapReceiverService } from './delete-snmp-trap'
import { StartSnmpAgentService } from './start-snmp-agent'
import { StopSnmpAgentService } from './stop-snmp-agent'
import { UpdateSnmpAgentService } from './update-snmp-agent'
import { UpdateSnmpTrapReceiverService } from './update-snmp-trap'

@Module({
  providers: [
    CreateSnmpAgentService,
    StartSnmpAgentService,
    StopSnmpAgentService,
    UpdateSnmpAgentService,
    CreateSnmpTrapReceiverService,
    DeleteSnmpTrapReceiverService,
    UpdateSnmpTrapReceiverService
  ],
  exports: []
})
export class SnmpManagementActionModule {}
