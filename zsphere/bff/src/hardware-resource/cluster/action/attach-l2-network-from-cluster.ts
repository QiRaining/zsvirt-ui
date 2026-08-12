import { Inject } from '@nestjs/common'
import { Args, Mutation } from '@nestjs/graphql'

import { AttachL2NetworkToClusterAction } from '@/api/zstack/AttachL2NetworkToClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionResult } from '@/common/model/action.model'

import {
  AttachOrDetachL2NetworkFromClusterInput,
  AttachOrDetachL2NetworksFromClusterActionInput
} from '../cluster.model'

export class AttachL2NetworksToClusterService extends ActionService {
  @Inject() attachL2NetworkToClusterAction: AttachL2NetworkToClusterAction

  @Mutation(() => ActionResult)
  attachL2NetworkToCluster(@Args('input') input: AttachOrDetachL2NetworksFromClusterActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'L2Network',
      async (payload: AttachOrDetachL2NetworkFromClusterInput, taskId: string) => {
        const { inventory } = await this.attachL2NetworkToClusterAction.call(
          {
            l2NetworkUuid: payload.l2NetworkUuid,
            clusterUuid: payload.clusterUuid,
            systemTags: payload.systemTags
          },
          { actionId, taskId }
        )
        return {
          id: payload.l2NetworkUuid,
          fields: 'attachedClusterUuids',
          inventory
        }
      }
    )
    return { actionId }
  }
}
