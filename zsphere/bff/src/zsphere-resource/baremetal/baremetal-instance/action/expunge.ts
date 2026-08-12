import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ExpungeBaremetalInstanceAction,
  ExpungeBaremetalInstanceResult
} from '@/api/zstack/ExpungeBaremetalInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ExpungeBaremetalInstancePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ExpungeBaremetalInstanceInput {
  @Field(() => [ExpungeBaremetalInstancePayload])
  payload: ExpungeBaremetalInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ExpungeBaremetalInstanceService extends ActionService {
  @Inject()
  expungeBaremetalInstanceAction: ExpungeBaremetalInstanceAction

  @Mutation(() => ActionResult)
  expungeBaremetalInstance(@Args('input') input: ExpungeBaremetalInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalInstance',
      async (payload: ExpungeBaremetalInstancePayload, taskId: string) => {
        const { uuid } = payload
        const result: ExpungeBaremetalInstanceResult =
          await this.expungeBaremetalInstanceAction.call(
            {
              uuid
            },
            { actionId, taskId }
          )
        return {
          id: uuid
        }
      }
    )
    return { actionId }
  }
}
