import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RefreshNvmeTargetAction } from '@/api/zstack/RefreshNvmeTargetAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RefreshNvmeTargetPayload {
  @Field(() => String, { description: '区域UUID' })
  zoneUuid: string

  @Field(() => [String], {
    nullable: true,
    defaultValue: null,
    description:
      '块设备UUID列表。1，null - 刷物理机上所有记录在MN 的 FiberChannelScsiLun 容量；2，[] - 不刷容量；3，[x, y, z] - 刷 scsiLunUuid 为 x, y, z 的容量。'
  })
  nvmeLunUuids?: string[]
}

@InputType()
class RefreshNvmeTargetInput {
  @Field(() => [RefreshNvmeTargetPayload])
  payload: RefreshNvmeTargetPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RefreshNvmeTargetService extends ActionService {
  @Inject() refreshNvmeTargetAction: RefreshNvmeTargetAction

  @Mutation(() => ActionResult)
  refreshNvmeTargets(
    @Args('input')
    input: RefreshNvmeTargetInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'NvmeTarget',
      async ({ zoneUuid, nvmeLunUuids = null }: RefreshNvmeTargetPayload, taskId: string) => {
        await this.refreshNvmeTargetAction.call(
          {
            zoneUuid,
            nvmeLunUuids
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
