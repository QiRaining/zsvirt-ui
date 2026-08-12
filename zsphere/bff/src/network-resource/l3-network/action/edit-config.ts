import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'
import { isNil } from 'lodash'

import { AttachNetworkServiceToL3NetworkAction } from '@/api/zstack/AttachNetworkServiceToL3NetworkAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeL3NetworkDhcpIpAddressAction } from '@/api/zstack/ChangeL3NetworkDhcpIpAddressAction'
import { DetachNetworkServiceFromL3NetworkAction } from '@/api/zstack/DetachNetworkServiceFromL3NetworkAction'
import { SetL3NetworkMtuAction } from '@/api/zstack/SetL3NetworkMtuAction'
import { UpdateL2NetworkVirtualNetworkIdAction } from '@/api/zstack/UpdateL2NetworkVirtualNetworkIdAction'
import { UpdateL3NetworkAction } from '@/api/zstack/UpdateL3NetworkAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql'

@InputType()
class VlanIdPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Int)
  virtualNetworkId: number
}

@InputType()
class EditL3NetworkConfigPayload {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => VlanIdPayload, { nullable: true })
  vlanIdParams?: VlanIdPayload

  @Field(() => String, { nullable: true })
  l3NetworkUuid: string

  @Field(() => Int, { nullable: true })
  mtu?: number

  @Field(() => String, { nullable: true })
  ipAllocateStrategy?: string

  @Field(() => Boolean, { nullable: true })
  dhcpService?: boolean

  @Field(() => String, { nullable: true })
  dhcpIpv4?: string

  @Field(() => String, { nullable: true })
  dhcpIpv6?: string
}

@InputType()
export class EditL3NetworkConfigInput {
  @Field(() => [EditL3NetworkConfigPayload])
  payload: EditL3NetworkConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditL3NetworkConfigService extends ActionService {
  @Inject() setL3NetworkMtuAction: SetL3NetworkMtuAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction
  @Inject() updateL3NetworkAction: UpdateL3NetworkAction
  @Inject()
  updateL2NetworkVirtualNetworkIdAction: UpdateL2NetworkVirtualNetworkIdAction //for vlanid
  @Inject()
  changeL3NetworkDhcpIpAddressAction: ChangeL3NetworkDhcpIpAddressAction
  @Inject()
  attachNetworkServiceToL3NetworkAction: AttachNetworkServiceToL3NetworkAction
  @Inject()
  detachNetworkServiceFromL3NetworkAction: DetachNetworkServiceFromL3NetworkAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  editL3NetworkConfig(@Args('input') input: EditL3NetworkConfigInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: EditL3NetworkConfigPayload, taskId: string) => {
      const {
        l3NetworkUuid,
        mtu,
        ipAllocateStrategy,
        dhcpService,
        dhcpIpv4,
        dhcpIpv6,
        name,
        description,
        vlanIdParams
      } = payload

      const actionAndTaskId = {
        actionId,
        taskId
      }

      if (!isNil(name) || !isNil(description)) {
        await this.updateL3NetworkAction.call(
          {
            uuid: l3NetworkUuid,
            name,
            description
          },
          actionAndTaskId
        )
      }

      if (!isNil(mtu)) {
        await this.setL3NetworkMtuAction.call({ l3NetworkUuid, mtu }, actionAndTaskId)
      }

      if (ipAllocateStrategy) {
        await this.updateResourceConfigAction.call(
          {
            resourceUuid: l3NetworkUuid,
            name: 'ipAllocateStrategy',
            category: 'l3Network',
            value: ipAllocateStrategy
          },
          actionAndTaskId
        )
      }
      if (vlanIdParams?.uuid) {
        await this.updateL2NetworkVirtualNetworkIdAction.call(vlanIdParams, actionAndTaskId)
      }

      let dhcpServiceUuid = ''
      if (!isNil(dhcpService) || dhcpIpv4 || dhcpIpv6) {
        const { results = [] } = await this.zqlService.call(
          ZQL.stringify({
            tableName: 'NetworkServiceProvider',
            fields: ['uuid'],
            condition: {
              type: {
                [ZOp.eq]: 'Flat'
              },
              networkServiceTypes: {
                [ZOp.in]: ['DHCP']
              }
            }
          })
        )
        dhcpServiceUuid = results[0]?.inventories?.[0]?.uuid ?? ''
      }

      if (!isNil(dhcpService)) {
        if (dhcpService) {
          const dhcpIpSystemTags = [dhcpIpv4, dhcpIpv6]
            .filter(val => !!val)
            .map(val => `flatNetwork::DhcpServer::${val.replace('::', '--')}::ipUuid::null`)

          await this.attachNetworkServiceToL3NetworkAction.call(
            {
              l3NetworkUuid,
              networkServices: {
                [dhcpServiceUuid]: ['DHCP']
              },
              systemTags: dhcpIpSystemTags
            },
            actionAndTaskId
          )
        } else {
          await this.detachNetworkServiceFromL3NetworkAction.call(
            {
              l3NetworkUuid,
              [`networkServices.${dhcpServiceUuid}`]: 'DHCP'
            },
            actionAndTaskId
          )
        }
      } else if (dhcpIpv4 || dhcpIpv6) {
        await this.changeL3NetworkDhcpIpAddressAction.call(
          {
            l3NetworkUuid,
            dhcpServerIp: dhcpIpv4,
            dhcpv6ServerIp: dhcpIpv6
          },
          actionAndTaskId
        )
      }

      return {
        id: payload.l3NetworkUuid,
        fields: 'mtu',
        inventory: {
          mtu: payload.mtu
        }
      }
    }

    this.actionHelper(input, 'L3Network', actionFn)
    return { actionId }
  }
}
