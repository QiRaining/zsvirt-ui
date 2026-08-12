import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { SetVmMonitorNumberAction } from '@/api/zstack/SetVmMonitorNumberAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmMonitorNumberPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Int)
  monitorNumber: number
}

@InputType()
export class SetVmMonitorNumberInput {
  @Field(() => [SetVmMonitorNumberPayload])
  payload: SetVmMonitorNumberPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmMonitorNumberService extends ActionService {
  @Inject() setVmMonitorNumberAction: SetVmMonitorNumberAction

  @Mutation(() => ActionResult)
  setVmMonitorNumber(@Args('input') input: SetVmMonitorNumberInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmMonitorNumberPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }
  async actionFn(payload: SetVmMonitorNumberPayload, taskId: string, actionId: string) {
    await this.setVmMonitorNumberAction.call(payload, { actionId, taskId })
    return {
      id: payload.uuid,
      fields: 'systemTag { VDIMonitorNumber }',
      inventory: {
        systemTag: {
          VDIMonitorNumber: payload.monitorNumber
        }
      }
    }
  }
}
