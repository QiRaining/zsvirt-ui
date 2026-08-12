import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  UpdateResourceConfigAction,
  UpdateResourceConfigResult
} from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class BatchUpdateResourceConfigPayload {
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
class BatchUpdateResourceConfigInput {
  @Field(() => [BatchUpdateResourceConfigPayload])
  payload: BatchUpdateResourceConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class BatchUpdateResourceConfigService extends ActionService {
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction

  @Mutation(() => ActionResult)
  batchUpdateResourceConfig(@Args('input') input: BatchUpdateResourceConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ResourceConfigInPage',
      async (payload: BatchUpdateResourceConfigPayload, taskId: string) => {
        await this.updateResourceConfigAction.call({ ...payload }, { actionId, taskId })
        return {
          id: `${payload.category}.${payload.name}`,
          fields: 'value',
          inventory: { value: payload.value }
        }
      }
    )
    return { actionId }
  }
}
