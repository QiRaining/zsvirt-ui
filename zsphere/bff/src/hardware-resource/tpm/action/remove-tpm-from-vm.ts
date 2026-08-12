import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { RemoveTpmAction } from '@/api/zstack/RemoveTpmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class RemoveTpmFromVmPayload {
  @Field(() => String, { nullable: true })
  tpmUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string
}

@InputType()
class RemoveTpmFromVmInput {
  @Field(() => RemoveTpmFromVmPayload)
  payload: RemoveTpmFromVmPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveTpmFromVmService extends ActionService {
  @Inject() removeTpmAction: RemoveTpmAction

  @Mutation(() => ActionResult)
  removeTpmFromVm(@Args('input') input: RemoveTpmFromVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Tpm',
      async (payload: RemoveTpmFromVmPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: RemoveTpmFromVmPayload, taskId: string, actionId: string) {
    const { tpmUuid, vmInstanceUuid } = payload
    const params: { tpmUuid?: string; vmInstanceUuid?: string } = {}
    if (tpmUuid) {
      params.tpmUuid = tpmUuid
    }
    if (vmInstanceUuid) {
      params.vmInstanceUuid = vmInstanceUuid
    }
    await this.removeTpmAction.call(params, { actionId, taskId })
    return {
      id: tpmUuid ?? vmInstanceUuid
    }
  }
}
