import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateTagAction, CreateTagResult } from '@/api/zstack/CreateTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateTagPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  value: string

  @Field(() => String, { nullable: true })
  color?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class CreateTagInput {
  @Field(() => CreateTagPayload)
  payload: CreateTagPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateTagService extends ActionService {
  @Inject() createTagAction: CreateTagAction

  @Mutation(() => ActionResult)
  createTag(@Args('input') input: CreateTagInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Tag', async (payload: CreateTagPayload, taskId: string) => {
      const { name, value, color, description } = payload
      const result = await this.createTagAction.call(
        { name, value, color, description },
        { actionId, taskId }
      )
      return {
        id: result?.inventory?.uuid
      }
    })
    return { actionId }
  }
}
