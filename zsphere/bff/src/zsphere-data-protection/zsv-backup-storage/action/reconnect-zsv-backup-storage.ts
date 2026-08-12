import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ReconnectBackupStorageAction } from '@/api/zstack/ReconnectBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ReconnectZSVBackupStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ReconnectZSVBackupStorageInput {
  @Field(() => [ReconnectZSVBackupStoragePayload])
  payload: ReconnectZSVBackupStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReconnectZSVBackupStorageService extends ActionService {
  @Inject()
  reconnectBackupStorageAction: ReconnectBackupStorageAction

  @Mutation(() => ActionResult)
  reconnectZSVBackupStorage(@Args('input') input: ReconnectZSVBackupStorageInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: ReconnectZSVBackupStoragePayload, taskId: string) => {
      const { inventory } = await this.reconnectBackupStorageAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.uuid,
        fields: 'status',
        inventory
      }
    }

    this.actionHelper(input, 'ZSVBackupStorage', actionFn)
    return { actionId }
  }
}
