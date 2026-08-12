import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AttachIsoToVmInstanceAction } from '@/api/zstack/AttachIsoToVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AttachIsoToVmInstancePayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  isoUuid: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
export class AttachIsoToVmInstanceInput {
  @Field(() => [AttachIsoToVmInstancePayload])
  payload: AttachIsoToVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachIsoToVmInstanceService extends ActionService {
  @Inject() attachIsoToVmInstanceAction: AttachIsoToVmInstanceAction

  @Mutation(() => ActionResult)
  attachIsoToVmInstance(@Args('input') input: AttachIsoToVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: AttachIsoToVmInstancePayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: AttachIsoToVmInstancePayload, taskId: string, actionId: string) {
    const { inventory } = await this.attachIsoToVmInstanceAction.call(
      { ...payload },
      { actionId, taskId }
    )
    return {
      id: payload.vmInstanceUuid,
      inventory
    }
  }
}
