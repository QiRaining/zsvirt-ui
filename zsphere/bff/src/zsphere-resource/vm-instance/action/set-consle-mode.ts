import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetVmConsoleModeAction } from '@/api/zstack/SetVmConsoleModeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmConsoleModePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  mode: string
}

@InputType()
class SetVmConsoleModeInput {
  @Field(() => [SetVmConsoleModePayload])
  payload: SetVmConsoleModePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmConsoleModeService extends ActionService {
  @Inject() setVmConsoleModeAction: SetVmConsoleModeAction

  @Mutation(() => ActionResult)
  setVmConsoleMode(@Args('input') input: SetVmConsoleModeInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmConsoleModePayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: SetVmConsoleModePayload, taskId: string, actionId: string) {
    await this.setVmConsoleModeAction.call(payload, { actionId, taskId })

    return {
      id: payload.uuid,
      inventory: {
        vmConsoleMode: payload.mode
      }
    }
  }
}
