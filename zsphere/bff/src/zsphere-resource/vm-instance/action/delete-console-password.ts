import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteVmConsolePasswordAction } from '@/api/zstack/DeleteVmConsolePasswordAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteVmConsolePasswordPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteVmConsolePasswordInput {
  @Field(() => DeleteVmConsolePasswordPayload)
  payload: DeleteVmConsolePasswordPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVmConsolePasswordService extends ActionService {
  @Inject() deleteVmConsolePasswordAction: DeleteVmConsolePasswordAction

  @Mutation(() => ActionResult)
  deleteVmConsolePassword(@Args('input') input: DeleteVmConsolePasswordInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: DeleteVmConsolePasswordPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: DeleteVmConsolePasswordPayload, taskId: string, actionId: string) {
    const { uuid } = payload
    await this.deleteVmConsolePasswordAction.call(payload, {
      actionId,
      taskId
    })
    return {
      id: uuid,
      fields: 'systemTag { consolePassword }',
      inventory: { systemTag: { consolePassword: null } }
    }
  }
}
