//import { QueryAction } from '@/common/model/action-query.model'
import { Inject } from '@nestjs/common'
import { Query, Resolver } from '@nestjs/graphql'

import {
  DoubleManagementNodeInfo,
  ManagementNode,
  ManagementNodeQueryResp,
  ManagementNodeIp,
  ManagementNodesStatus
} from './management-node.model'
import { ManagementNodeService } from './management-node.service'

@Resolver(() => ManagementNode)
export class ManagementNodeResolver {
  @Inject() managementNodeService: ManagementNodeService

  @Query(() => ManagementNodeQueryResp)
  async managementNodeList(): Promise<ManagementNodeQueryResp> {
    return await this.managementNodeService.query()
  }

  @Query(() => Boolean)
  async isDoubleManagementNode() {
    return await this.managementNodeService.isDoubleManagementNode()
  }

  @Query(() => DoubleManagementNodeInfo)
  async getDoubleManagementNodeInfo() {
    return await this.managementNodeService.getDoubleManagementNodeInfo()
  }

  @Query(() => ManagementNodeIp)
  async getManagementNodeIp() {
    return await this.managementNodeService.getManagementNodeIp()
  }

  @Query(() => ManagementNodesStatus)
  async getManagementNodesStatus() {
    return await this.managementNodeService.getManagementNodesStatus()
  }
}
