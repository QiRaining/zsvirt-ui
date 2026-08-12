import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateSNSApplicationPlatformAction } from '@/api/zstack/UpdateSNSApplicationPlatformAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateSNSEmailPlatformPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => [String], { nullable: true })
  userTags?: string[]

  @Field(() => String, { nullable: true })
  sessionId?: string

  @Field(() => String, { nullable: true })
  accessKeyId?: string

  @Field(() => String, { nullable: true })
  accessKeySecret?: string

  @Field(() => String, { nullable: true })
  requestIp?: string
}

@InputType()
class UpdateSNSEmailPlatformInput {
  @Field(() => [UpdateSNSEmailPlatformPayload])
  payload: UpdateSNSEmailPlatformPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateEmailServerSettingService extends ActionService {
  @Inject()
  updateSNSApplicationPlatformAction: UpdateSNSApplicationPlatformAction

  @Mutation(() => ActionResult)
  updateSNSEmailServer(@Args('input') input: UpdateSNSEmailPlatformInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateSNSEmailPlatformPayload, taskId: string) => {
      const { inventory } = await this.updateSNSApplicationPlatformAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.uuid,
        fields: 'name,description',
        inventory
      }
    }

    this.actionHelper(input, 'EmailServerSetting', actionFn)
    return { actionId }
  }
}
