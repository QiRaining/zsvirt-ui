import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ReconnectPrimaryStorageAction,
  ReconnectPrimaryStorageResult
} from '@/api/zstack/ReconnectPrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ReconnectPrimaryStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ReconnectPrimaryStorageInput {
  @Field(() => [ReconnectPrimaryStoragePayload])
  payload: ReconnectPrimaryStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReconnectPrimaryStorageService extends ActionService {
  @Inject() reconnectPrimaryStorageAction: ReconnectPrimaryStorageAction

  @Mutation(() => ActionResult)
  reconnectPrimaryStorageList(@Args('input') input: ReconnectPrimaryStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: ReconnectPrimaryStoragePayload, taskId: string) => {
        const { uuid } = payload
        const result: ReconnectPrimaryStorageResult = await this.reconnectPrimaryStorageAction.call(
          {
            uuid
          },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'status,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
