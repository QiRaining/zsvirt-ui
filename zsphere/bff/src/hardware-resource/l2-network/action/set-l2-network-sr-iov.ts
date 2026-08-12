import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { ActionInfo } from '@/api/zstack/base/types'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SetL2NetworkSrIovInput {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  enable: boolean
}
@InputType()
export class SetL2NetworkSrIovActionInput {
  @Field(() => SetL2NetworkSrIovInput)
  payload: SetL2NetworkSrIovInput

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetL2NetworkSrIovService extends ActionService {
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() deleteTagAction: DeleteTagAction

  @Mutation(() => ActionResult)
  setL2NetworkSrIov(@Args('input') input: SetL2NetworkSrIovActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'L2Network',
      async (payload: SetL2NetworkSrIovInput, taskId: string) => {
        const { uuid, enable } = payload

        const { inventories } = await this.querySystemTagAction.call({
          conditions: [
            {
              key: 'resourceUuid',
              op: Op.eq,
              value: uuid
            },
            {
              key: 'resourceType',
              op: Op.eq,
              value: 'L2NetworkVO'
            },
            {
              key: 'tag',
              op: Op.eq,
              value: 'enableSRIOV'
            }
          ]
        })

        if (inventories?.length > 0) {
          const tagUuid = inventories?.[0]?.uuid
          enable
            ? await this.enableSrIov(uuid, { actionId, taskId })
            : await this.disableSrIov(tagUuid, { actionId, taskId })

          return {
            id: payload.uuid,
            fields: 'enableSRIOV',
            inventory: { enableSRIOV: enable }
          }
        }

        await this.createSystemTagAction.call(
          {
            resourceType: 'L2NetworkVO',
            resourceUuid: uuid,
            tag: 'enableSRIOV'
          },
          { actionId, taskId }
        )

        return {
          id: payload.uuid,
          fields: 'enableSRIOV',
          inventory: { enableSRIOV: true }
        }
      }
    )
    return { actionId }
  }

  async enableSrIov(tagUuid, actionInfo: ActionInfo) {
    return await this.updateSystemTagAction.call(
      {
        tag: 'enableSRIOV',
        uuid: tagUuid
      },
      actionInfo
    )
  }

  async disableSrIov(tagUuid, actionInfo: ActionInfo) {
    return await this.deleteTagAction.call(
      {
        uuid: tagUuid
      },
      actionInfo
    )
  }
}
