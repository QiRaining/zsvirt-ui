import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateVmUserDefinedXmlHookScriptAction } from '@/api/zstack/UpdateVmUserDefinedXmlHookScriptAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateXmlHookPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  hookScript?: string

  // "Reboot", "None"
  @Field(() => String, { nullable: true })
  startupStrategy?: string
}

@InputType()
class UpdateXmlHookInput {
  @Field(() => UpdateXmlHookPayload)
  payload: UpdateXmlHookPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateXmlHookService extends ActionService {
  @Inject() updateXmlHookAction: UpdateVmUserDefinedXmlHookScriptAction

  @Mutation(() => ActionResult)
  updateXmlHook(@Args('input') input: UpdateXmlHookInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'XmlHook', async (payload: UpdateXmlHookPayload, taskId: string) => {
      const { inventory } = await this.updateXmlHookAction.call(
        { ...payload },
        { actionId, taskId }
      )
      return {
        id: inventory?.uuid,
        inventory
      }
    })
    return { actionId }
  }
}
