import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangePreconfigurationTemplateStateAction } from '@/api/zstack/ChangePreconfigurationTemplateStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangePreconfigurationTemplateStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  stateEvent: string
}

@InputType()
class ChangePreconfigurationTemplateStateInput {
  @Field(() => [ChangePreconfigurationTemplateStatePayload])
  payload: ChangePreconfigurationTemplateStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangePreconfigurationTemplateStateService extends ActionService {
  @Inject()
  action: ChangePreconfigurationTemplateStateAction

  @Mutation(() => ActionResult)
  changePreconfigurationTemplateState(
    @Args('input') input: ChangePreconfigurationTemplateStateInput
  ) {
    const actionId = input.action.actionId

    const actionFn = async (
      payload: ChangePreconfigurationTemplateStatePayload,
      taskId: string
    ) => {
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
