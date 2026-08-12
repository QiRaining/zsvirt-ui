import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ChangeBackupStorageStateAction } from '@/api/zstack/ChangeBackupStorageStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeZSVBackupStorageStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  stateEvent: string
}

@InputType()
class ChangeZSVBackupStorageStateInput {
  @Field(() => [ChangeZSVBackupStorageStatePayload])
  payload: ChangeZSVBackupStorageStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}
export class ChangeZSVBackupStorageStateService extends ActionService {
  @Inject()
  changeBackupStorageStateAction: ChangeBackupStorageStateAction

  @Mutation(() => ActionResult)
  changeZSVBackupStorageState(@Args('input') input: ChangeZSVBackupStorageStateInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: ChangeZSVBackupStorageStatePayload, taskId: string) => {
      const result = await this.changeBackupStorageStateAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.uuid,
        fields: 'state',
        inventory: result.inventory
      }
    }

    this.actionHelper(input, 'ZSVBackupStorage', actionFn)
    return { actionId }
  }
}
