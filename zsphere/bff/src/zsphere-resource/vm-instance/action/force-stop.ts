import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateVmInstanceAction, UpdateVmInstanceResult } from '@/api/zstack/UpdateVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ForceStopVmInstancePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ForceStopVmInstanceInput {
  @Field(() => [ForceStopVmInstancePayload])
  payload: ForceStopVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ForceStopVmInstanceService extends ActionService {
  @Inject() updateVmInstanceAction: UpdateVmInstanceAction

  @Mutation(() => ActionResult)
  forceStopVmInstance(@Args('input') input: ForceStopVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: ForceStopVmInstancePayload, taskId: string) => {
        const result: UpdateVmInstanceResult = await this.updateVmInstanceAction.call(
          {
            uuid: payload.uuid,
            state: 'Stopped'
          },
          { actionId, taskId }
        )
        // 防止报错
        if (!result.inventory.description) {
          result.inventory.description = ''
        }
        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
