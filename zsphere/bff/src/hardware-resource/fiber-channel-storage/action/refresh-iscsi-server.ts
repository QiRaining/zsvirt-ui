import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RefreshFiberChannelStorageAction } from '@/api/zstack/RefreshFiberChannelStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RefreshFiberChannelStoragePayload {
  @Field(() => String, { description: '区域UUID' })
  zoneUuid: string

  @Field(() => [String], {
    nullable: true,
    defaultValue: null,
    description:
      '块设备UUID列表。1，null - 刷物理机上所有记录在MN 的 FiberChannelScsiLun 容量；2，[] - 不刷容量；3，[x, y, z] - 刷 scsiLunUuid 为 x, y, z 的容量。'
  })
  scsiLunUuids?: string[]
}

@InputType()
class RefreshFiberChannelStorageInput {
  @Field(() => [RefreshFiberChannelStoragePayload])
  payload: RefreshFiberChannelStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RefreshFiberChannelStorageService extends ActionService {
  @Inject() refreshFiberChannelStorageAction: RefreshFiberChannelStorageAction

  @Mutation(() => ActionResult)
  refreshFiberChannelStorages(
    @Args('input')
    input: RefreshFiberChannelStorageInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'FiberChannelStorage',
      async (
        { zoneUuid, scsiLunUuids = null }: RefreshFiberChannelStoragePayload,
        taskId: string
      ) => {
        await this.refreshFiberChannelStorageAction.call(
          {
            zoneUuid,
            scsiLunUuids
          },
          { actionId, taskId }
        )

        return {
          id: zoneUuid
        }
      }
    )

    return { actionId }
  }
}
