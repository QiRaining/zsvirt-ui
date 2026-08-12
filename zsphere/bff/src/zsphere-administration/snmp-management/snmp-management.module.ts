import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { SnmpManagementActionModule } from './action/_module'
import { SnmpManagementService } from './snmp-management-query/snmp-management-query.service'
import { SnmpAgentResolver, SnmpTrapReceiverResolver } from './snmp-management.resolver'

@Module({
  imports: [SnmpManagementActionModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [SnmpAgentResolver, SnmpTrapReceiverResolver, SnmpManagementService],
  exports: [SnmpManagementService]
})
export class SnmpManagementModule {}
