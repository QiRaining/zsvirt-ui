import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, Int } from '@nestjs/graphql'

import { SetVmDnsAction } from '@/api/zstack/SetVmDnsAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { UpdateVmNetworkConfigService } from '@/zsphere-resource/vm-nic/action/sync-network-config'

@InputType()
export class SetVmDnsPayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  vmNicUuid?: string

  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => [String])
  dnsList: string[]

  @Field(() => Int, { nullable: true })
  ipVersion?: number
}

@InputType()
class SetVmDnsInput {
  @Field(() => SetVmDnsPayload)
  payload: SetVmDnsPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmDnsService extends ActionService {
  @Inject() setVmDnsAction: SetVmDnsAction
  @Inject() updateVmNetworkConfigService: UpdateVmNetworkConfigService

  @Mutation(() => ActionResult)
  setVmDns(@Args('input') input: SetVmDnsInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'VmInstance', async (payload: SetVmDnsPayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: SetVmDnsPayload, taskId: string, actionId: string) {
    const { l3NetworkUuid, vmInstanceUuid, vmNicUuid, ipVersion, dnsList } = payload

    await this.setVmDnsAction.call(
      { vmInstanceUuid, vmNicUuid, ipVersion, dnsList },
      { actionId, taskId }
    )

    if (l3NetworkUuid || vmNicUuid) {
      await this.updateVmNetworkConfigService.syncConfig(
        { vmInstanceUuid, vmNicUuid, l3NetworkUuid },
        { actionId, taskId }
      )
    }

    return { id: vmInstanceUuid }
  }
}
