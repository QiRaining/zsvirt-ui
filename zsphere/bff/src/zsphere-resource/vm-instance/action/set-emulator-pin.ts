import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetVmEmulatorPinningAction } from '@/api/zstack/SetVmEmulatorPinningAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmEmulatorPinPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  emulatorPinning: string
}

@InputType()
class SetVmEmulatorPinInput {
  @Field(() => [SetVmEmulatorPinPayload])
  payload: SetVmEmulatorPinPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmEmulatorPinService extends ActionService {
  @Inject() setVmEmulatorPinningAction: SetVmEmulatorPinningAction

  @Mutation(() => ActionResult)
  setVmEmulatorPin(@Args('input') input: SetVmEmulatorPinInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmEmulatorPinPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: SetVmEmulatorPinPayload, taskId: string, actionId: string) {
    await this.setVmEmulatorPinningAction.call(payload, {
      actionId,
      taskId
    })

    return {
      id: payload.uuid,
      fields: 'emulatorPin',
      inventory: payload.emulatorPinning
    }
  }
}
