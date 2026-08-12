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
class MaintainPrimaryStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class MaintainPrimaryStorageInput {
  @Field(() => [MaintainPrimaryStoragePayload])
  payload: MaintainPrimaryStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class MaintainPrimaryStorageService extends ActionService {
  @Inject() changePrimaryStorageStateAction: ChangePrimaryStorageStateAction

  @Mutation(() => ActionResult)
  maintainPrimaryStorageList(@Args('input') input: MaintainPrimaryStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: MaintainPrimaryStoragePayload, taskId: string) => {
        const { uuid } = payload
        const result: ChangePrimaryStorageStateResult =
          await this.changePrimaryStorageStateAction.call(
            {
              uuid,
              stateEvent: PrimaryStorageStateEvent.maintain
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
