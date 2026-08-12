import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { QueryBaremetalPxeServerAction } from '@/api/zstack/QueryBaremetalPxeServerAction'
import { ReconnectBaremetalPxeServerAction } from '@/api/zstack/ReconnectBaremetalPxeServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ReconnectBaremetalPxeServerPayload {
  @Field(() => String, { description: '这里传入的实际上是clusterUuid' })
  uuid: string
}

@InputType()
class ReconnectBaremetalPxeServerInput {
  @Field(() => [ReconnectBaremetalPxeServerPayload])
  payload: ReconnectBaremetalPxeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReconnectBaremetalPxeServerService extends ActionService {
  @Inject()
  reconnectBaremetalPxeServerAction: ReconnectBaremetalPxeServerAction
  @Inject() queryBaremetalPxeServerAction: QueryBaremetalPxeServerAction

  @Mutation(() => ActionResult)
  reconnectBaremetalPxeServer(@Args('input') input: ReconnectBaremetalPxeServerInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'BaremetalPxeServer',
      async (payload: ReconnectBaremetalPxeServerPayload, taskId: string) => {
        const { uuid } = payload

        // 使用conditions查询PXE服务器
        const queryResult = await this.queryBaremetalPxeServerAction.call(
          {
            conditions: [
              {
                key: 'attachedClusterUuids',
                op: Op.eq,
                value: uuid
              }
            ]
          },
          { actionId, taskId }
        )

        if (!queryResult.inventories || queryResult.inventories.length === 0) {
          throw new Error(`未找到关联到集群 ${uuid} 的PXE服务器`)
        }

        const pxeServerUuid = queryResult.inventories[0].uuid

        const result = await this.reconnectBaremetalPxeServerAction.call(
          { uuid: pxeServerUuid },
          { actionId, taskId }
        )
        return {
          id: pxeServerUuid,
          fields: 'status',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
