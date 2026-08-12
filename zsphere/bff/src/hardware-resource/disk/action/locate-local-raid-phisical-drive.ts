import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { LocateLocalRaidPhysicalDriveAction } from '@/api/zstack/LocateLocalRaidPhysicalDriveAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class LocateLocalRaidPhysicalDrivePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  locate: boolean
}

@InputType()
class LocateLocalRaidPhysicalDriveInput {
  @Field(() => LocateLocalRaidPhysicalDrivePayload)
  payload: LocateLocalRaidPhysicalDrivePayload

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 磁盘点灯
 *
 */
export class LocateLocalRaidPhysicalDriveService extends ActionService {
  @Inject()
  locateLocalRaidPhysicalDriveAction: LocateLocalRaidPhysicalDriveAction

  @Mutation(() => ActionResult)
  locateLocalRaidPhysicalDrive(@Args('input') input: LocateLocalRaidPhysicalDriveInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Disk',
      async (payload: LocateLocalRaidPhysicalDrivePayload, taskId: string) => {
        const { inventory } = await this.locateLocalRaidPhysicalDriveAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload.uuid,
          fields: 'uuid,locateStatus',
          inventory
        }
      }
    )
    return { actionId }
  }
}
