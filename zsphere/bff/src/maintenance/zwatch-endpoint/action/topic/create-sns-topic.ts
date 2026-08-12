import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSNSTopicAction, CreateSNSTopicResult } from '@/api/zstack/CreateSNSTopicAction'
import { ActionService } from '@/base/action-service'
import { ActionResult } from '@/common/model/action.model'

@InputType()
class CreateSNSTopicInput {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  locale?: string
}

export class CreateSNSTopicService extends ActionService {
  @Inject() createSNSTopicAction: CreateSNSTopicAction

  @Mutation(() => ActionResult)
  async createSNSTopic(
    input: CreateSNSTopicInput,
    actionInfo?: { actionId?: string; taskId?: string }
  ) {
    const result: CreateSNSTopicResult = await this.createSNSTopicAction.call(
      {
        ...input
      },
      { actionId: actionInfo?.actionId, taskId: actionInfo?.taskId }
    )
    return {
      createSnsInventory: result.inventory
    }
  }
}
