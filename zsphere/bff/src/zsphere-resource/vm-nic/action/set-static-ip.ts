import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { SetVmStaticIpAction } from '@/api/zstack/SetVmStaticIpAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { UpdateVmNetworkConfigService } from './sync-network-config'

@InputType()
export class SetVmStaticIpPayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  vmNicUuid?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  ip6?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => String, { nullable: true })
  ipv6Prefix?: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  ipv6Gateway?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
class SetVmStaticIpInput {
  @Field(() => SetVmStaticIpPayload)
  payload: SetVmStaticIpPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmStaticIpService extends ActionService {
  @Inject() SetVmStaticIpAction: SetVmStaticIpAction
  @Inject() updateVmNetworkConfigService: UpdateVmNetworkConfigService

  @Mutation(() => ActionResult)
  setVmStaticIp(@Args('input') input: SetVmStaticIpInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'VmNic', async (payload: SetVmStaticIpPayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: SetVmStaticIpPayload, taskId: string, actionId: string) {
    // SetVmStaticIpAction该API不支持systemTags设置指定ip的各种参数，做个处理转换
    const { systemTags = [] } = payload
    systemTags.forEach(tag => {
      const keyMap = {
        ipv4Gateway: 'gateway',
        ipv4Netmask: 'netmask'
      }
      const [key, l3NetworkUuid, value] = tag.split('::')
      payload[keyMap[key] ?? key] = value.replace('--', '::')
    })
    if (Reflect.has(payload, 'systemTags')) {
      Reflect.deleteProperty(payload, 'systemTags')
    }

    const res = await this.SetVmStaticIpAction.call(payload, {
      actionId,
      taskId
    })

    await this.updateVmNetworkConfigService.syncConfig(payload, {
      actionId,
      taskId
    })
    return {
      id: payload.vmInstanceUuid
    }
  }
}
