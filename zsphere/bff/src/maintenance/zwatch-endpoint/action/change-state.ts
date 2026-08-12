import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ChangeSNSApplicationEndpointStateAction,
  ChangeSNSApplicationEndpointStateResult
} from '@/api/zstack/ChangeSNSApplicationEndpointStateAction'
import { ActionService } from '@/base/action-service'
import { StateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeEndpointStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => StateEvent)
  stateEvent: StateEvent
}

@InputType()
class ChangeEndpointInput {
  @Field(() => [ChangeEndpointStatePayload])
  payload: ChangeEndpointStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeEndpointStateService extends ActionService {
  @Inject() changeAction: ChangeSNSApplicationEndpointStateAction

  @Mutation(() => ActionResult)
  changeSNSApplicationEndpoint(@Args('input') input: ChangeEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPoint',
      async (payload: ChangeEndpointStatePayload, taskId: string) => {
        const { uuid, stateEvent } = payload
        const result: ChangeSNSApplicationEndpointStateResult = await this.changeAction.call(
          {
            uuid,
            stateEvent
          },
          { actionId, taskId }
        )
        return {
          id: uuid,
          fields: 'state,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
