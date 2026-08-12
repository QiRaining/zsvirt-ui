import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  StopBaremetalInstanceAction,
  StopBaremetalInstanceResult
} from '@/api/zstack/StopBaremetalInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class StopBaremetalInstancePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class StopBaremetalInstanceInput {
  @Field(() => [StopBaremetalInstancePayload])
  payload: StopBaremetalInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class StopBaremetalInstanceService extends ActionService {
  @Inject()
  stopBaremetalInstanceAction: StopBaremetalInstanceAction

  @Mutation(() => ActionResult)
  stopBaremetalInstance(@Args('input') input: StopBaremetalInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalInstance',
      async (payload: StopBaremetalInstancePayload, taskId: string) => {
        const { uuid } = payload
        const result: StopBaremetalInstanceResult = await this.stopBaremetalInstanceAction.call(
          {
            uuid,
            type: 'grace'
          },
          { actionId, taskId }
        )
        return {
          id: uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
