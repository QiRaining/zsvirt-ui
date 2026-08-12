import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateL3NetworkAction } from '@/api/zstack/UpdateL3NetworkAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateL3NetworkPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
export class UpdateL3NetworkInput {
  @Field(() => UpdateL3NetworkPayload)
  payload: UpdateL3NetworkPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateL3NetworkService extends ActionService {
  @Inject() updateL3NetworkAction: UpdateL3NetworkAction

  @Mutation(() => ActionResult)
  updateL3Network(@Args('input') input: UpdateL3NetworkInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateL3NetworkPayload, taskId: string) => {
      const { inventory } = await this.updateL3NetworkAction.call(payload, {
        actionId,
        taskId
      })

      return {
        id: inventory?.uuid,
        fields: 'name,description,lastOpDate',
        inventory
      }
    }

    this.actionHelper(input, 'L3Network', actionFn)
    return { actionId }
  }
}
