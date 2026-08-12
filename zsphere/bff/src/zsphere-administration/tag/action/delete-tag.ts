import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteTagAction, DeleteTagResult } from '@/api/zstack/DeleteTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteTagPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteTagInput {
  @Field(() => [DeleteTagPayload])
  payload: DeleteTagPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteTagService extends ActionService {
  @Inject() deleteTagAction: DeleteTagAction

  @Mutation(() => ActionResult)
  deleteTag(@Args('input') input: DeleteTagInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Tag', async (payload: DeleteTagPayload, taskId: string) => {
      const { uuid } = payload
      await this.deleteTagAction.call({ uuid }, { actionId, taskId })
      return {
        id: payload.uuid
      }
    })
    return { actionId }
  }
}
