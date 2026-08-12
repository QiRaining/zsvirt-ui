import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeletePreconfigurationTemplateAction } from '@/api/zstack/DeletePreconfigurationTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeletePreconfigurationTemplatePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeletePreconfigurationTemplateInput {
  @Field(() => [DeletePreconfigurationTemplatePayload])
  payload: DeletePreconfigurationTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeletePreconfigurationTemplateService extends ActionService {
  @Inject()
  action: DeletePreconfigurationTemplateAction

  @Mutation(() => ActionResult)
  deletePreConfigurationTemplate(@Args('input') input: DeletePreconfigurationTemplateInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeletePreconfigurationTemplatePayload, taskId: string) => {
      await this.action.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.uuid
      }
    }

    this.actionHelper(input, 'PreconfigurationTemplate', actionFn)
    return { actionId }
  }
}
