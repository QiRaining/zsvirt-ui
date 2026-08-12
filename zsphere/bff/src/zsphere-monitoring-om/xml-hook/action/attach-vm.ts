import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AttachUserDefinedXmlHookScriptToVmAction } from '@/api/zstack/AttachUserDefinedXmlHookScriptToVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AttachXmlHookToVmPayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  xmlHookUuid: string

  // "Reboot", "None"
  @Field(() => String, { nullable: true })
  startupStrategy?: string
}

@InputType()
class AttachXmlHookToVmInput {
  @Field(() => [AttachXmlHookToVmPayload])
  payload: AttachXmlHookToVmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachXmlHookToVmService extends ActionService {
  @Inject()
  attachUserDefinedXmlHookScriptToVmAction: AttachUserDefinedXmlHookScriptToVmAction

  @Mutation(() => ActionResult)
  attachXmlHookToVm(@Args('input') input: AttachXmlHookToVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'XmlHook',
      async (payload: AttachXmlHookToVmPayload, taskId: string) => {
        await this.attachUserDefinedXmlHookScriptToVmAction.call(
          { ...payload },
          { actionId, taskId }
        )
        return {
          id: payload?.xmlHookUuid
        }
      }
    )
    return { actionId }
  }
}
