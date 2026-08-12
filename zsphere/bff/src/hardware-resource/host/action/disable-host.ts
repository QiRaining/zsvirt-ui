import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeHostStateAction, ChangeHostStateResult } from '@/api/zstack/ChangeHostStateAction'
import { ActionService } from '@/base/action-service'
import { HostStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DisableHostPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DisableHostInput {
  @Field(() => [DisableHostPayload])
  payload: DisableHostPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DisableHostService extends ActionService {
  @Inject() changeHostStateAction: ChangeHostStateAction

  @Mutation(() => ActionResult)
  disableHosts(@Args('input') input: DisableHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: DisableHostPayload, taskId: string) => {
      const { uuid } = payload
      const result: ChangeHostStateResult = await this.changeHostStateAction.call(
        {
          uuid,
          stateEvent: HostStateEvent.disable
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
