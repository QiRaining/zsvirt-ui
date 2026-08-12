import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  StartBaremetalInstanceAction,
  StartBaremetalInstanceResult
} from '@/api/zstack/StartBaremetalInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class StartBaremetalInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  pxeBoot: boolean
}

@InputType()
class StartBaremetalInstanceInput {
  @Field(() => [StartBaremetalInstancePayload])
  payload: StartBaremetalInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class StartBaremetalInstanceService extends ActionService {
  @Inject()
  startBaremetalInstanceAction: StartBaremetalInstanceAction

  @Mutation(() => ActionResult)
  startBaremetalInstance(@Args('input') input: StartBaremetalInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalInstance',
      async (payload: StartBaremetalInstancePayload, taskId: string) => {
        const { uuid, pxeBoot } = payload
        const result: StartBaremetalInstanceResult = await this.startBaremetalInstanceAction.call(
          {
            uuid,
            pxeBoot
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
