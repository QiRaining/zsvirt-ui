import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { CreateSNSEmailPlatformAction } from '@/api/zstack/CreateSNSEmailPlatformAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateSNSEmailPlatformPayload {
  @Field(() => Int)
  smtpPort: number

  @Field(() => String)
  name: string

  @Field(() => String)
  smtpServer: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String, { nullable: true })
  encryptType?: string

  @Field(() => [String], { nullable: true })
  systemTags: string[]

  @Field(() => [String], { nullable: true })
  configuration: string[]
}

@InputType()
class CreateSNSEmailPlatformInput {
  @Field(() => CreateSNSEmailPlatformPayload)
  payload: CreateSNSEmailPlatformPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateEmailServerSettingService extends ActionService {
  @Inject() createSNSEmailPlatformAction: CreateSNSEmailPlatformAction

  @Mutation(() => ActionResult)
  createSNSEmailServer(@Args('input') input: CreateSNSEmailPlatformInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: CreateSNSEmailPlatformPayload, taskId: string) => {
      const { inventory } = await this.createSNSEmailPlatformAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: inventory.uuid
      }
    }

    this.actionHelper(input, 'EmailServerSetting', actionFn)
    return { actionId }
  }
}
