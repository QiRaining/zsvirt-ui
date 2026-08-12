import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteBackupStorageAction } from '@/api/zstack/DeleteBackupStorageAction'
import { DeleteZoneAction } from '@/api/zstack/DeleteZoneAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsHttpService } from '@/common/trans/zs-http-service/zs-http-service.service'

@InputType()
class DeleteZonePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteZoneInput {
  @Field(() => [DeleteZonePayload])
  payload: DeleteZonePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteZoneService extends ActionService {
  @Inject() deleteAction: DeleteZoneAction
  @Inject() deleteBackupStorageAction: DeleteBackupStorageAction
  @Inject() zsHttpService: ZsHttpService

  @Mutation(() => ActionResult)
  deleteZone(@Args('input') input: DeleteZoneInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Zone', async (payload: DeleteZonePayload, taskId: string) => {
      const { uuid } = payload
      const url = `backup-storage?q=zone.uuid=${uuid}`
      const result = await this.zsHttpService.get(url)
      const { inventories } = result.data
      const tasks = inventories.map(cv =>
        this.deleteBackupStorageAction.call({ uuid: cv.uuid }, { actionId, taskId })
      )
      await Promise.all([
        ...tasks,
        this.deleteAction.call(
          {
            uuid
          },
          { actionId, taskId }
        )
      ])
      return {
        id: uuid,
        inventory: {
          actionType: 'delete'
        }
      }
    })
    return { actionId }
  }
}
