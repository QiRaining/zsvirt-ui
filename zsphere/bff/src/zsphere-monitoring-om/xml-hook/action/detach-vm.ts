import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DetachUserDefinedXmlHookScriptFromVmAction } from '@/api/zstack/DetachUserDefinedXmlHookScriptFromVmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DettachXmlHookFromVmPayload {
  @Field(() => String)
  vmInstanceUuid: string

  // "Reboot", "None"
  @Field(() => String, { nullable: true })
  startupStrategy?: string
}

@InputType()
class DettachXmlHookFromVmInput {
  @Field(() => [DettachXmlHookFromVmPayload])
  payload: DettachXmlHookFromVmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachXmlHookFromVmService extends ActionService {
  @Inject()
  detachUserDefinedXmlHookScriptFromVmAction: DetachUserDefinedXmlHookScriptFromVmAction

  @Mutation(() => ActionResult)
  detachXmlHookFromVm(@Args('input') input: DettachXmlHookFromVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'XmlHook',
      async (payload: DettachXmlHookFromVmPayload, taskId: string) => {
        await this.detachUserDefinedXmlHookScriptFromVmAction.call(
          { ...payload },
          { actionId, taskId }
        )
        return {
          id: payload?.vmInstanceUuid
        }
      }
    )
    return { actionId }
  }
}
