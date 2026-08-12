import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DetachBackupStorageFromZoneAction } from '@/api/zstack/DetachBackupStorageFromZoneAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DetachBackupStorageFromZonePayload {
  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  backupStorageUuid: string
}

@InputType()
export class DetachBackupStorageFromZoneInput {
  @Field(() => [DetachBackupStorageFromZonePayload])
  payload: DetachBackupStorageFromZonePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachRemoteBackupStorageFromZoneService extends ActionService {
  @Inject()
  action: DetachBackupStorageFromZoneAction

  @Mutation(() => ActionResult)
  detachBackupStorageFromZone(@Args('input') input: DetachBackupStorageFromZoneInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DetachBackupStorageFromZonePayload, taskId: string) => {
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
