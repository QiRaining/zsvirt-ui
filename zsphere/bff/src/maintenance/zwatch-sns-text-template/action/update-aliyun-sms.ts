import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateAliyunSmsSNSTextTemplateAction } from '@/api/zstack/UpdateAliyunSmsSNSTextTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateAliyunSmsSNSTextTemplatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  subject?: string

  @Field(() => String, { nullable: true })
  recoverySubject?: string

  @Field(() => String, { nullable: true })
  sign?: string

  @Field(() => String, { nullable: true })
  alarmTemplateCode?: string

  @Field(() => String, { nullable: true })
  eventTemplateCode?: string

  @Field(() => String, { nullable: true })
  template?: string

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
export class UpdateAliyunSmsSNSTextTemplateInput {
  @Field(() => UpdateAliyunSmsSNSTextTemplatePayload)
  payload: UpdateAliyunSmsSNSTextTemplatePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateAliyunSmsSNSTextTemplateService extends ActionService {
  @Inject() updateAction: UpdateAliyunSmsSNSTextTemplateAction

  @Mutation(() => ActionResult)
  updateAliyunSmsSNSTextTemplate(
    @Args('input') input: UpdateAliyunSmsSNSTextTemplateInput
  ): ActionResult {
    const { actionId } = input.action
    this.actionHelper(
      input,
      'SNSTextTemplate',
      async (payload: UpdateAliyunSmsSNSTextTemplatePayload, taskId: string) => {
        const { inventory } = await this.updateAction.call(payload, {
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
