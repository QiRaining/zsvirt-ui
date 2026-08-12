import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateSNSTextTemplateAction } from '@/api/zstack/UpdateSNSTextTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetDefaultSNSTextTemplatePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class SetDefaultSNSTextTemplateInput {
  @Field(() => [SetDefaultSNSTextTemplatePayload])
  payload: SetDefaultSNSTextTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetDefaultSNSTextTemplateService extends ActionService {
  @Inject() updateSNSTextTemplateAction: UpdateSNSTextTemplateAction

  @Mutation(() => ActionResult)
  setDefaultSNSTextTemplate(@Args('input') input: SetDefaultSNSTextTemplateInput): ActionResult {
    const { actionId } = input.action
    this.actionHelper(
      input,
      'SNSTextTemplate',
      async (payload: SetDefaultSNSTextTemplatePayload, taskId) => {
        await this.updateSNSTextTemplateAction.call(
          {
            ...payload,
            defaultTemplate: true
          },
          {
            actionId,
            taskId
          }
        )
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
