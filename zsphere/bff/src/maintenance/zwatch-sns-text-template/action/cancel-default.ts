import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateSNSTextTemplateAction } from '@/api/zstack/UpdateSNSTextTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CancelDefaultSNSTextTemplatePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class CancelDefaultSNSTextTemplateInput {
  @Field(() => [CancelDefaultSNSTextTemplatePayload])
  payload: CancelDefaultSNSTextTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CancelDefaultSNSTextTemplateService extends ActionService {
  @Inject() updateSNSTextTemplateAction: UpdateSNSTextTemplateAction

  @Mutation(() => ActionResult)
  cancelDefaultSNSTextTemplate(
    @Args('input') input: CancelDefaultSNSTextTemplateInput
  ): ActionResult {
    const { actionId } = input.action
    this.actionHelper(
      input,
      'SNSTextTemplate',
      async (payload: CancelDefaultSNSTextTemplatePayload, taskId) => {
        await this.updateSNSTextTemplateAction.call(
          {
            ...payload,
            defaultTemplate: false
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
