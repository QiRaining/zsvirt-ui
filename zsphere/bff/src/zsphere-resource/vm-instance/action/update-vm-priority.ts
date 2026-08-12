import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateVmPriorityAction } from '@/api/zstack/UpdateVmPriorityAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateVmPriorityPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  priority: 'Normal' | 'High' | 'CpuHigh' | 'MemoryHigh' | 'ApplianceVmHigh'
}

@InputType()
export class UpdateVmPriorityInput {
  @Field(() => [UpdateVmPriorityPayload])
  payload: UpdateVmPriorityPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVmPriorityService extends ActionService {
  @Inject() updateVmPriorityAction: UpdateVmPriorityAction

  @Mutation(() => ActionResult)
  updateVmPriority(@Args('input') input: UpdateVmPriorityInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: UpdateVmPriorityPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: UpdateVmPriorityPayload, taskId: string, actionId: string) {
    await this.updateVmPriorityAction.call(payload, { actionId, taskId })

    return {
      id: payload.uuid,
      inventory: {
        vmPriority: payload.priority
      }
    }
  }
}
