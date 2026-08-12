import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ExpungeVmUserDefinedXmlHookScriptAction } from '@/api/zstack/ExpungeVmUserDefinedXmlHookScriptAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteXmlHookPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteXmlHookInput {
  @Field(() => [DeleteXmlHookPayload])
  payload: DeleteXmlHookPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteXmlHookService extends ActionService {
  @Inject() deleteXmlHookAction: ExpungeVmUserDefinedXmlHookScriptAction

  @Mutation(() => ActionResult)
  deleteXmlHook(@Args('input') input: DeleteXmlHookInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'XmlHook', async (payload: DeleteXmlHookPayload, taskId: string) => {
      await this.deleteXmlHookAction.call({ ...payload }, { actionId, taskId })
      return {
        id: payload.uuid
      }
    })
    return { actionId }
  }
}
