import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  DetachPrimaryStorageFromClusterAction,
  DetachPrimaryStorageFromClusterResult
} from '@/api/zstack/DetachPrimaryStorageFromClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DetachPrimaryStorageFromClusterPayload {
  @Field(() => String)
  primaryStorageUuid: string

  @Field(() => String)
  clusterUuid: string
}

@InputType()
class DetachPrimaryStorageFromClusterInput {
  @Field(() => [DetachPrimaryStorageFromClusterPayload])
  payload: DetachPrimaryStorageFromClusterPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachPrimaryStorageFromClusterService extends ActionService {
  @Inject()
  detachPrimaryStorageFromClusterAction: DetachPrimaryStorageFromClusterAction

  @Mutation(() => ActionResult)
  detachPrimaryStorageFromCluster(@Args('input') input: DetachPrimaryStorageFromClusterInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: DetachPrimaryStorageFromClusterPayload, taskId: string) => {
        const result: DetachPrimaryStorageFromClusterResult =
          await this.detachPrimaryStorageFromClusterAction.call(
            {
              ...payload
            },
            { actionId, taskId }
          )
        return {
          id: payload.primaryStorageUuid,
          fields: 'attachedClusterUuids',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
