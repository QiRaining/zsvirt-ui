import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  RecoverBaremetalInstanceAction,
  RecoverBaremetalInstanceResult
} from '@/api/zstack/RecoverBaremetalInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RecoverBaremetalInstancePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class RecoverBaremetalInstanceInput {
  @Field(() => [RecoverBaremetalInstancePayload])
  payload: RecoverBaremetalInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RecoverBaremetalInstanceService extends ActionService {
  @Inject()
  recoverBaremetalInstanceAction: RecoverBaremetalInstanceAction

  @Mutation(() => ActionResult)
  recoverBaremetalInstance(@Args('input') input: RecoverBaremetalInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalInstance',
      async (payload: RecoverBaremetalInstancePayload, taskId: string) => {
        const { uuid } = payload
        const result: RecoverBaremetalInstanceResult =
          await this.recoverBaremetalInstanceAction.call(
            {
              uuid
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
