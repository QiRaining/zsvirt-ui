import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  UpdateBaremetalInstanceAction,
  UpdateBaremetalInstanceResult
} from '@/api/zstack/UpdateBaremetalInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateBaremetalInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class UpdateBaremetalInstanceInput {
  @Field(() => [UpdateBaremetalInstancePayload])
  payload: UpdateBaremetalInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateBaremetalInstanceService extends ActionService {
  @Inject()
  updateBaremetalInstanceAction: UpdateBaremetalInstanceAction

  @Mutation(() => ActionResult)
  updateBaremetalInstance(@Args('input') input: UpdateBaremetalInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalInstance',
      async (payload: UpdateBaremetalInstancePayload, taskId: string) => {
        const { uuid, name, description } = payload
        const result: UpdateBaremetalInstanceResult = await this.updateBaremetalInstanceAction.call(
          {
            uuid,
            name,
            description
          },
          { actionId, taskId }
        )
        return {
          id: uuid,
          fields: 'name,description',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
