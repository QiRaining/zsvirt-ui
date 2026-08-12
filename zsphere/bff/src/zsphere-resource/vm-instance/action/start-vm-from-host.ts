import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { StartVmInstanceAction, StartVmInstanceResult } from '@/api/zstack/StartVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class StartVmInstanceFromHostPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  hostUuid: string
}

@InputType()
class StartVmInstanceFromHostInput {
  @Field(() => StartVmInstanceFromHostPayload)
  payload: StartVmInstanceFromHostPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class StartVmInstanceFromHostService extends ActionService {
  @Inject() startVmInstanceAction: StartVmInstanceAction

  @Mutation(() => ActionResult)
  startVmFromHost(@Args('input') input: StartVmInstanceFromHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: StartVmInstanceFromHostPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: StartVmInstanceFromHostPayload, taskId: string, actionId) {
    const { uuid, hostUuid } = payload
    const result: StartVmInstanceResult = await this.startVmInstanceAction.call(
      {
        uuid,
        hostUuid
      },
      { actionId, taskId }
    )
    return {
      id: payload.uuid,
      fields: 'state',
      inventory: result.inventory
    }
  }
}
