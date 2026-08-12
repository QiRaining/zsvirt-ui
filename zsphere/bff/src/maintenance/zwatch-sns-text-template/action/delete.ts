import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteSNSTextTemplateAction } from '@/api/zstack/DeleteSNSTextTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteSNSTextTemplatePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteSNSTextTemplateInput {
  @Field(() => [DeleteSNSTextTemplatePayload])
  payload: DeleteSNSTextTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteSNSTextTemplateService extends ActionService {
  @Inject() deleteAction: DeleteSNSTextTemplateAction

  @Mutation(() => ActionResult)
  deleteSNSTextTemplate(@Args('input') input: DeleteSNSTextTemplateInput): ActionResult {
    const { actionId } = input.action
    this.actionHelper(
      input,
      'SNSTextTemplate',
      async (payload: DeleteSNSTextTemplatePayload, taskId) => {
        await this.deleteAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
