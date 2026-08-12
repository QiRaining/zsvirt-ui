import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { CreateAliyunSmsSNSTextTemplateAction } from '@/api/zstack/CreateAliyunSmsSNSTextTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateAliyunSmsSNSTextTemplatePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  subject?: string

  @Field(() => String, { nullable: true })
  recoverySubject?: string

  @Field(() => String)
  sign: string

  @Field(() => String)
  alarmTemplateCode: string

  @Field(() => String)
  eventTemplateCode: string

  @Field(() => String)
  applicationPlatformType: string

  @Field(() => String)
  template: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  eventTemplate?: string

  @Field(() => String, { nullable: true })
  recoveryTemplate?: string

  @Field(() => Boolean, { nullable: true })
  defaultTemplate?: boolean
}

@InputType()
export class CreateAliyunSmsSNSTextTemplateInput {
  @Field(() => CreateAliyunSmsSNSTextTemplatePayload)
  payload: CreateAliyunSmsSNSTextTemplatePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateAliyunSmsSNSTextTemplateService extends ActionService {
  @Inject() createAction: CreateAliyunSmsSNSTextTemplateAction

  @Mutation(() => ActionResult)
  createAliyunSmsSNSTextTemplate(
    @Args('input') input: CreateAliyunSmsSNSTextTemplateInput
  ): ActionResult {
    const { actionId } = input.action
    this.actionHelper(
      input,
      'SNSTextTemplate',
      async (payload: CreateAliyunSmsSNSTextTemplatePayload, taskId: string) => {
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
