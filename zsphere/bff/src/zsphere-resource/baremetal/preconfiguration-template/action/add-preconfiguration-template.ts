import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddPreconfigurationTemplateAction } from '@/api/zstack/AddPreconfigurationTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddPreconfigurationTemplatePayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  distribution: string

  @Field(() => String)
  type: string

  @Field(() => String)
  content: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class AddPreconfigurationTemplateInput {
  @Field(() => [AddPreconfigurationTemplatePayload])
  payload: AddPreconfigurationTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddPreconfigurationTemplateService extends ActionService {
  @Inject()
  action: AddPreconfigurationTemplateAction

  @Mutation(() => ActionResult)
  addPreconfigurationTemplate(@Args('input') input: AddPreconfigurationTemplateInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AddPreconfigurationTemplatePayload, taskId: string) => {
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
