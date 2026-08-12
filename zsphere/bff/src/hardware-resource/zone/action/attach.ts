import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AttachBackupStorageToZoneAction } from '@/api/zstack/AttachBackupStorageToZoneAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AttachBackupStorageToZonePayload {
  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  backupStorageUuid: string
}

@InputType()
export class AttachBackupStorageToZoneInput {
  @Field(() => [AttachBackupStorageToZonePayload])
  payload: AttachBackupStorageToZonePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachRemoteBackupStorageToZoneService extends ActionService {
  @Inject()
  action: AttachBackupStorageToZoneAction

  @Mutation(() => ActionResult)
  attachBackupStorageToZone(@Args('input') input: AttachBackupStorageToZoneInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AttachBackupStorageToZonePayload, taskId: string) => {
      await this.action.call(payload, {
        actionId,
        taskId
      })
      return {
        id: actionId
      }
    }

    this.actionHelper(input, 'RemoteBackupStorage', actionFn)
    return { actionId }
  }
}
