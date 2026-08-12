import { Inject } from '@nestjs/common'
import { Args, Mutation } from '@nestjs/graphql'

import { DetachL2NetworkFromClusterAction } from '@/api/zstack/DetachL2NetworkFromClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionResult } from '@/common/model/action.model'

import {
  AttachOrDetachL2NetworkFromClusterInput,
  AttachOrDetachL2NetworksFromClusterActionInput
} from '../cluster.model'

export class DetachL2NetworksFromClusterService extends ActionService {
  @Inject() detachL2NetworkFromClusterAction: DetachL2NetworkFromClusterAction

  @Mutation(() => ActionResult)
  detachL2NetworkFromCluster(@Args('input') input: AttachOrDetachL2NetworksFromClusterActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'L2Network',
      async (payload: AttachOrDetachL2NetworkFromClusterInput, taskId: string) => {
        const { inventory } = await this.detachL2NetworkFromClusterAction.call(
          {
            l2NetworkUuid: payload.l2NetworkUuid,
            clusterUuid: payload.clusterUuid
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
