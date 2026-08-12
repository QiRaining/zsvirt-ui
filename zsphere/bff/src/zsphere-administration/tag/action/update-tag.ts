import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateTagAction } from '@/api/zstack/UpdateTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateTagPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  value: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  color: string
}

@InputType()
class UpdateTagInput {
  @Field(() => UpdateTagPayload)
  payload: UpdateTagPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateTagService extends ActionService {
  @Inject() updateTagAction: UpdateTagAction

  @Mutation(() => ActionResult)
  updateTag(@Args('input') input: UpdateTagInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Tag', async (payload: UpdateTagPayload, taskId: string) => {
      const result = await this.updateTagAction.call({ ...payload }, { actionId, taskId })
      return {
        id: result?.inventory?.uuid,
        fields: 'name,description,color',
        inventory: {
          name: payload.name,
          description: payload.description,
          color: payload.color
        }
      }
    })
    return { actionId }
  }
}
