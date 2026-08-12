import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteBackupStorageAction } from '@/api/zstack/DeleteBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteBackupStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteBackupStorageInput {
  @Field(() => [DeleteBackupStoragePayload])
  payload: DeleteBackupStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteBackupStorageService extends ActionService {
  @Inject() deleteBackupStorageAction: DeleteBackupStorageAction

  transform(inventory) {
    if (inventory.state) {
      inventory.state = inventory.state.toLowerCase()
    }
    return inventory
  }

  @Mutation(() => ActionResult)
  deleteBackupStorage(@Args('input') input: DeleteBackupStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: DeleteBackupStoragePayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteBackupStorageAction.call({ uuid }, { actionId, taskId })
        return {
          id: payload.uuid,
          inventory: {
            actionType: 'delete',
            id: payload.uuid
          }
        }
      }
    )
    return { actionId }
  }
}
