import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ReconnectHostAction } from '@/api/zstack/ReconnectHostAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ReconnectHostPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ReconnectHostInput {
  @Field(() => [ReconnectHostPayload])
  payload: ReconnectHostPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReconnectHostService extends ActionService {
  @Inject() reconnectHostAction: ReconnectHostAction

  @Mutation(() => ActionResult)
  reconnectHosts(@Args('input') input: ReconnectHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: ReconnectHostPayload, taskId: string) => {
      const { uuid } = payload
      await this.reconnectHostAction.call(
        {
          uuid
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid
      }
    })
    return { actionId }
  }
}
