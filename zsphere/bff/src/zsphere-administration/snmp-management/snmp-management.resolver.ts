import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { SnmpManagementService } from './snmp-management-query/snmp-management-query.service'
import {
  QuerySnmpTrapReceiverArgs,
  SnmpAgent,
  SnmpAgentActionResp,
  SnmpTrapReceiver,
  SnmpTrapReceiverList
} from './snmp-management.model'

@Resolver(() => SnmpAgent)
export class SnmpAgentResolver {
  @Inject() snmpManagementService: SnmpManagementService

  @Query(() => SnmpAgentActionResp)
  getSnmpAgentConfig() {
    return this.snmpManagementService.getSnmpAgentConfigInfo()
  }
}

@Resolver(() => SnmpTrapReceiver)
export class SnmpTrapReceiverResolver {
  @Inject() snmpManagementService: SnmpManagementService

  @Query(() => SnmpTrapReceiverList)
  async snmpTrapList(@Args() queryArgs: QuerySnmpTrapReceiverArgs) {
    return this.snmpManagementService.getSnmpTrapReceiverList(queryArgs)
  }
}
