import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeHostStateAction, ChangeHostStateResult } from '@/api/zstack/ChangeHostStateAction'
import { ActionService } from '@/base/action-service'
import { HostStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class EnableHostPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class EnableHostInput {
  @Field(() => [EnableHostPayload])
  payload: EnableHostPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EnableHostService extends ActionService {
  @Inject() changeHostStateAction: ChangeHostStateAction

  @Mutation(() => ActionResult)
  enableHosts(@Args('input') input: EnableHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: EnableHostPayload, taskId: string) => {
      const { uuid } = payload
      const result: ChangeHostStateResult = await this.changeHostStateAction.call(
        {
          uuid,
          stateEvent: HostStateEvent.enable
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        fields: 'state',
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
