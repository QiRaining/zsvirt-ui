import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateVmUserDefinedXmlHookScriptAction } from '@/api/zstack/CreateVmUserDefinedXmlHookScriptAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateXmlHookPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  hookScript: string
}

@InputType()
class CreateXmlHookInput {
  @Field(() => CreateXmlHookPayload)
  payload: CreateXmlHookPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateXmlHookService extends ActionService {
  @Inject() createXmlHookAction: CreateVmUserDefinedXmlHookScriptAction

  @Mutation(() => ActionResult)
  createXmlHook(@Args('input') input: CreateXmlHookInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'XmlHook', async (payload: CreateXmlHookPayload, taskId: string) => {
      const { inventory } = await this.createXmlHookAction.call(
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
