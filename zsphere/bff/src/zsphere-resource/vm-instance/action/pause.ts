import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { PauseVmInstanceAction, PauseVmInstanceResult } from '@/api/zstack/PauseVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class PauseVmInstancePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class PauseVmInstanceInput {
  @Field(() => [PauseVmInstancePayload])
  payload: PauseVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class PauseVmInstanceService extends ActionService {
  @Inject() pauseVmInstanceAction: PauseVmInstanceAction

  @Mutation(() => ActionResult)
  pauseVmInstance(@Args('input') input: PauseVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: PauseVmInstancePayload, taskId: string) => {
        const { uuid } = payload
        const result: PauseVmInstanceResult = await this.pauseVmInstanceAction.call(
          { uuid },
          { actionId, taskId }
        )
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
