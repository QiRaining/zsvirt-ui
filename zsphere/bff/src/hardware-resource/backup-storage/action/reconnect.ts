import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ReconnectBackupStorageAction,
  ReconnectBackupStorageResult
} from '@/api/zstack/ReconnectBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ReconnectBackupStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ReconnectBackupStorageInput {
  @Field(() => [ReconnectBackupStoragePayload])
  payload: ReconnectBackupStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReconnectBackupStorageService extends ActionService {
  @Inject() reconnectBackupStorageAction: ReconnectBackupStorageAction

  // transform(inventory) {
  //   if (inventory.state) {
  //     inventory.state = inventory.state.toLowerCase()
  //   }
  //   return inventory
  // }

  @Mutation(() => ActionResult)
  reconnectBackupStorage(@Args('input') input: ReconnectBackupStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: ReconnectBackupStoragePayload, taskId: string) => {
        const { uuid } = payload
        const result: ReconnectBackupStorageResult = await this.reconnectBackupStorageAction.call(
          { uuid },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'status',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
