import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ChangeClusterStateAction,
  ChangeClusterStateResult
} from '@/api/zstack/ChangeClusterStateAction'
import { ActionService } from '@/base/action-service'
import { ActionResult } from '@/common/model/action.model'
import {
  ChangeClusterStateInput,
  ChangeClusterStatePayload,
  ClusterStateEvent
} from '@/hardware-resource/cluster/cluster.model'

export class EnableClusterService extends ActionService {
  @Inject() changeClusterStateAction: ChangeClusterStateAction

  @Mutation(() => ActionResult)
  enableCluster(@Args('input') input: ChangeClusterStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Cluster',
      async (payload: ChangeClusterStatePayload, taskId: string) => {
        const { uuid } = payload
        const result: ChangeClusterStateResult = await this.changeClusterStateAction.call(
          {
            uuid,
            stateEvent: ClusterStateEvent.enable
          },
          { actionId, taskId }
        )
        return {
          id: result.inventory.uuid,
          fields: 'state,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
