import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateL2NetworkAction } from '@/api/zstack/UpdateL2NetworkAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { UpdateL2NetworkInput } from '../l2.network.model'

@InputType()
export class UpdateL2NetworkActionInput {
  @Field(() => UpdateL2NetworkInput)
  payload: UpdateL2NetworkInput

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateL2NetworkService extends ActionService {
  @Inject() updateL2NetworkAction: UpdateL2NetworkAction

  @Mutation(() => ActionResult)
  updateL2Network(@Args('input') input: UpdateL2NetworkActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'L2Network', async (payload: UpdateL2NetworkInput, taskId: string) => {
      const { uuid, name, description } = payload

      const res = await this.updateL2NetworkAction.call(
        {
          uuid,
          name,
          description
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        fields: 'name,description',
        inventory: res.inventory
      }
    })
    return { actionId }
  }
}
