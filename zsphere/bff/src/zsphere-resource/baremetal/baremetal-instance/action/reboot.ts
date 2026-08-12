import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  RebootBaremetalInstanceAction,
  RebootBaremetalInstanceResult
} from '@/api/zstack/RebootBaremetalInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RebootBaremetalInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  pxeBoot: boolean
}

@InputType()
class RebootBaremetalInstanceInput {
  @Field(() => [RebootBaremetalInstancePayload])
  payload: RebootBaremetalInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RebootBaremetalInstanceService extends ActionService {
  @Inject()
  rebootBaremetalInstanceAction: RebootBaremetalInstanceAction

  @Mutation(() => ActionResult)
  rebootBaremetalInstance(@Args('input') input: RebootBaremetalInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalInstance',
      async (payload: RebootBaremetalInstancePayload, taskId: string) => {
        const { uuid, pxeBoot } = payload
        const result: RebootBaremetalInstanceResult = await this.rebootBaremetalInstanceAction.call(
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
