import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeHostStateAction, ChangeHostStateResult } from '@/api/zstack/ChangeHostStateAction'
import { ActionService } from '@/base/action-service'
import { HostStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class MaintenanceHostPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class MaintenanceHostInput {
  @Field(() => [MaintenanceHostPayload])
  payload: MaintenanceHostPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class MaintenanceHostService extends ActionService {
  @Inject() changeHostStateAction: ChangeHostStateAction

  @Mutation(() => ActionResult)
  maintenanceHosts(@Args('input') input: MaintenanceHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: MaintenanceHostPayload, taskId: string) => {
      const { uuid } = payload
      const result: ChangeHostStateResult = await this.changeHostStateAction.call(
        {
          uuid,
          stateEvent: HostStateEvent.maintain
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
