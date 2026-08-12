import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ValidateSNSEmailPlatformAction } from '@/api/zstack/ValidateSNSEmailPlatformAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ValidateSNSEmailPlatformPayload {
  @Field(() => String)
  uuid: string

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
class ValidateSNSEmailPlatformInput {
  @Field(() => [ValidateSNSEmailPlatformPayload])
  payload: ValidateSNSEmailPlatformPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ValidateEmailServerSettingService extends ActionService {
  @Inject()
  validateSNSEmailPlatformAction: ValidateSNSEmailPlatformAction

  @Mutation(() => ActionResult)
  validateSNSEmailServer(@Args('input') input: ValidateSNSEmailPlatformInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: ValidateSNSEmailPlatformPayload, taskId: string) => {
      const { uuid } = payload
      await this.validateSNSEmailPlatformAction.call(
        { uuid },
        {
          actionId,
          taskId
        }
      )
      return {
        id: payload.uuid
      }
    }

    this.actionHelper(input, 'EmailServerSetting', actionFn)
    return { actionId }
  }
}
