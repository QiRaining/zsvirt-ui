import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetVmConsolePasswordAction } from '@/api/zstack/SetVmConsolePasswordAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmConsolePasswordPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  consolePassword: string
}

@InputType()
class SetVmConsolePasswordInput {
  @Field(() => SetVmConsolePasswordPayload)
  payload: SetVmConsolePasswordPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmConsolePasswordService extends ActionService {
  @Inject() setVmConsolePasswordAction: SetVmConsolePasswordAction

  @Mutation(() => ActionResult)
  setVmConsolePassword(@Args('input') input: SetVmConsolePasswordInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmConsolePasswordPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: SetVmConsolePasswordPayload, taskId: string, actionId: string) {
    const { uuid, consolePassword } = payload
    await this.setVmConsolePasswordAction.call(payload, {
      actionId,
      taskId
    })
    return {
      id: uuid,
      fields: 'systemTag { consolePassword }',
      inventory: { systemTag: { consolePassword } }
    }
  }
}
