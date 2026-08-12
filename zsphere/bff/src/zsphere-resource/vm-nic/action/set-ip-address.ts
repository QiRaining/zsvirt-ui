import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { replace } from 'lodash'

import { ChangeVmNicNetworkAction } from '@/api/zstack/ChangeVmNicNetworkAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ipToInt, intToIp } from '@/utils'

import { UpdateVmNetworkConfigService } from './sync-network-config'

@InputType()
export class ChangeVmNicNetworkPayload {
  @Field(() => String, { description: '当前网卡的uuid' })
  vmNicUuid: string

  @Field(() => String, { description: '三层网的uuid' })
  destL3NetworkUuid: string

  @Field(() => String, { description: 'ip4', nullable: true })
  staticIpv4: string

  @Field(() => String, { description: 'ip6', nullable: true })
  staticIpv6: string

  @Field(() => [String], { nullable: true })
  systemTags: string[]

  @Field(() => String, { nullable: true })
  vmNicParams?: string
}

@InputType()
class ChangeVmNicNetworkInput {
  @Field(() => ChangeVmNicNetworkPayload)
  payload: ChangeVmNicNetworkPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeVmNicNetworkService extends ActionService {
  @Inject() changeVmNicNetworkAction: ChangeVmNicNetworkAction
  @Inject() updateVmNetworkConfigService: UpdateVmNetworkConfigService

  @Mutation(() => ActionResult)
  changeVmNicNetwork(@Args('input') input: ChangeVmNicNetworkInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmNic',
      async (payload: ChangeVmNicNetworkPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )

    return { actionId }
  }

  async actionFn(payload: ChangeVmNicNetworkPayload, taskId: string, actionId: string) {
    const {
      staticIpv4,
      staticIpv6,
      vmNicUuid,
      destL3NetworkUuid,
      vmNicParams,
      systemTags = []
    } = payload

    if (staticIpv4) {
      systemTags.push(`staticIp::${destL3NetworkUuid}::${staticIpv4}`)
    }

    if (staticIpv6) {
      systemTags.push(`staticIp::${destL3NetworkUuid}::${replace(staticIpv6, '::', '--')}`)
    }

    await this.changeVmNicNetworkAction.call(
      {
        vmNicUuid,
        destL3NetworkUuid,
        vmNicParams,
        systemTags
      },
      {
        actionId,
        taskId
      }
    )
    await this.updateVmNetworkConfigService.syncConfig(
      { vmNicUuid },
      {
        actionId,
        taskId
      }
    )

    return {
      id: payload.vmNicUuid
    }
  }

  getIpAfterAddIndex(ip: string, index: number): string {
    const isIpv6: boolean = ip.indexOf(':') > -1
    if (isIpv6) {
      const eachByteOfIp: string[] = ip.split(':')
      eachByteOfIp[eachByteOfIp.length - 1] = (
        parseInt(eachByteOfIp[eachByteOfIp.length - 1], 16) + index
      ).toString(16)
      const tmpIp: string = eachByteOfIp.join(':')
      return tmpIp
    } else {
      return intToIp(ipToInt(ip) + index)
    }
  }
}
