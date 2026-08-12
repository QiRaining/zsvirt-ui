import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdatePreconfigurationTemplateAction } from '@/api/zstack/UpdatePreconfigurationTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdatePreconfigurationTemplatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class UpdatePreconfigurationTemplateInput {
  @Field(() => [UpdatePreconfigurationTemplatePayload])
  payload: UpdatePreconfigurationTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdatePreconfigurationTemplateService extends ActionService {
  @Inject()
  action: UpdatePreconfigurationTemplateAction

  @Mutation(() => ActionResult)
  updatePreconfigurationTemplate(@Args('input') input: UpdatePreconfigurationTemplateInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdatePreconfigurationTemplatePayload, taskId: string) => {
      const { inventory } = await this.action.call(payload, {
        actionId,
        taskId
      })
      return {
        id: inventory.uuid,
        //fields: '字段名称',
        inventory
      }
    }

    this.actionHelper(input, 'PreconfigurationTemplate', actionFn)
    return { actionId }
  }
}
