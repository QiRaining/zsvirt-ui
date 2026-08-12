import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DetachIsoFromVmInstanceAction } from '@/api/zstack/DetachIsoFromVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DetachIsoFromVmInstancePayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  isoUuid: string
}

@InputType()
class DetachIsoFromVmInstanceInput {
  @Field(() => [DetachIsoFromVmInstancePayload])
  payload: DetachIsoFromVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachIsoFromVmInstanceService extends ActionService {
  @Inject() detachIsoFromVmInstanceAction: DetachIsoFromVmInstanceAction

  @Mutation(() => ActionResult)
  detachIsoFromVmInstance(@Args('input') input: DetachIsoFromVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: DetachIsoFromVmInstancePayload, taskId: string) => {
        return await this.actionFn(payload, actionId, taskId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: DetachIsoFromVmInstancePayload, taskId: string, actionId: string) {
    const { vmInstanceUuid, isoUuid } = payload
    const { inventory } = await this.detachIsoFromVmInstanceAction.call(
      { vmInstanceUuid, isoUuid },
      { actionId, taskId }
    )
    return {
      id: payload.vmInstanceUuid,
      inventory
    }
  }
}
