import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { CreateSNSTextTemplateAction } from '@/api/zstack/CreateSNSTextTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateSNSTextTemplatePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String)
  applicationPlatformType: string

  @Field(() => String)
  template: string

  @Field(() => String, { nullable: true })
  recoveryTemplate: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { nullable: true })
  defaultTemplate?: boolean

  @Field(() => String, { nullable: true })
  subject?: string

  @Field(() => String, { nullable: true })
  recoverySubject?: string
}

@InputType()
export class CreateSNSTextTemplateInput {
  @Field(() => CreateSNSTextTemplatePayload)
  payload: CreateSNSTextTemplatePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateSNSTextTemplateService extends ActionService {
  @Inject() createAction: CreateSNSTextTemplateAction

  @Mutation(() => ActionResult)
  createSNSTextTemplate(@Args('input') input: CreateSNSTextTemplateInput): ActionResult {
    const { actionId } = input.action
    this.actionHelper(
      input,
      'SNSTextTemplate',
      async (payload: CreateSNSTextTemplatePayload, taskId) => {
        const { inventory } = await this.createAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: inventory.uuid
        }
      }
    )
    return { actionId }
  }
}
