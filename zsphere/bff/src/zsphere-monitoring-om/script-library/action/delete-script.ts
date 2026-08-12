import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteGuestVmScriptAction } from '@/api/zstack/DeleteGuestVmScriptAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteScriptPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteScriptInput {
  @Field(() => [DeleteScriptPayload])
  payload: DeleteScriptPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteScriptService extends ActionService {
  @Inject() deleteGuestVmScriptAction: DeleteGuestVmScriptAction

  @Mutation(() => ActionResult)
  deleteScript(@Args('input') input: DeleteScriptInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Script', async (payload: DeleteScriptPayload, taskId: string) => {
      await this.deleteGuestVmScriptAction.call({ ...payload }, { actionId, taskId })
      return {
        id: payload.uuid
      }
    })
    return { actionId }
  }
}
