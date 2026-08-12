import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import {
  UpdateResourceConfigAction,
  UpdateResourceConfigResult
} from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateResourceConfigPayload {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String)
  name: string

  @Field(() => String)
  category: string

  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  value: string
}

@InputType()
class UpdateResourceConfigInput {
  @Field(() => [UpdateResourceConfigPayload])
  payload: UpdateResourceConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateResourceConfigService extends ActionService {
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction

  @Mutation(() => ActionResult)
  updateResourceConfig(@Args('input') input: UpdateResourceConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ResourceConfigInPage',
      async (payload: UpdateResourceConfigPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }
  async actionFn(payload: UpdateResourceConfigPayload, taskId: string, actionId) {
    const { name, category, resourceUuid, value } = payload
    const result: UpdateResourceConfigResult = await this.updateResourceConfigAction.call(
      { name, category, resourceUuid, value },
      { actionId, taskId }
    )
    return {
      id: payload.uuid,
      fields: 'value',
      inventory: result.inventory
    }
  }
}
