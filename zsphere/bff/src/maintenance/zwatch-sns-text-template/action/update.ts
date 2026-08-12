import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateSNSTextTemplateAction } from '@/api/zstack/UpdateSNSTextTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateSNSTextTemplatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  template?: string

  @Field(() => String, { nullable: true })
  recoveryTemplate?: string

  @Field(() => Boolean, { nullable: true })
  defaultTemplate?: boolean

  @Field(() => String, { nullable: true })
  subject?: string

  @Field(() => String, { nullable: true })
  recoverySubject?: string
}

@InputType()
export class UpdateSNSTextTemplateInput {
  @Field(() => UpdateSNSTextTemplatePayload)
  payload: UpdateSNSTextTemplatePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSNSTextTemplateService extends ActionService {
  @Inject() updateAction: UpdateSNSTextTemplateAction

  @Mutation(() => ActionResult)
  updateSNSTextTemplate(@Args('input') input: UpdateSNSTextTemplateInput): ActionResult {
    const { actionId } = input.action
    this.actionHelper(
      input,
      'SNSTextTemplate',
      async (payload: UpdateSNSTextTemplatePayload, taskId) => {
        const { inventory } = await this.updateAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload.uuid,
          fields:
            'name,description,template,recoveryTemplate,defaultTemplate,subject,recoverySubject',
          inventory
        }
      }
    )
    return { actionId }
  }
}
