import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ChangePrimaryStorageStateAction,
  ChangePrimaryStorageStateResult
} from '@/api/zstack/ChangePrimaryStorageStateAction'
import { ActionService } from '@/base/action-service'
import { PrimaryStorageStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DisablePrimaryStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DisablePrimaryStorageInput {
  @Field(() => [DisablePrimaryStoragePayload])
  payload: DisablePrimaryStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DisablePrimaryStorageService extends ActionService {
  @Inject() changePrimaryStorageStateAction: ChangePrimaryStorageStateAction

  @Mutation(() => ActionResult)
  disablePrimaryStorageList(@Args('input') input: DisablePrimaryStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: DisablePrimaryStoragePayload, taskId: string) => {
        const { uuid } = payload
        const result: ChangePrimaryStorageStateResult =
          await this.changePrimaryStorageStateAction.call(
            {
              uuid,
              stateEvent: PrimaryStorageStateEvent.disable
            },
            { actionId, taskId }
          )
        return {
          id: payload.uuid,
          fields: 'state,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
