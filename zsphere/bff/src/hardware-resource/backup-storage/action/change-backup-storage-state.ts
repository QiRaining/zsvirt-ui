import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ChangeBackupStorageStateAction,
  ChangeBackupStorageStateResult
} from '@/api/zstack/ChangeBackupStorageStateAction'
import { ActionService } from '@/base/action-service'
import { BackupStorageStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ChangeBackupStorageStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => BackupStorageStateEvent)
  stateEvent: BackupStorageStateEvent
}

@InputType()
export class ChangeBackupStorageStateInput {
  @Field(() => [ChangeBackupStorageStatePayload])
  payload: ChangeBackupStorageStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeBackupStorageStateService extends ActionService {
  @Inject() changeBackupStorageStateAction: ChangeBackupStorageStateAction

  @Mutation(() => ActionResult)
  changeBackupStorageState(@Args('input') input: ChangeBackupStorageStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: ChangeBackupStorageStatePayload, taskId: string) => {
        const result: ChangeBackupStorageStateResult =
          await this.changeBackupStorageStateAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
