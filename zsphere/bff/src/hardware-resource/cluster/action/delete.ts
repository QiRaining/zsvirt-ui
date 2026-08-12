import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteClusterAction } from '@/api/zstack/DeleteClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionResult, ActionInput } from '@/common/model/action.model'

@InputType()
export class DeleteClusterStatePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteClusterInput {
  @Field(() => [DeleteClusterStatePayload])
  payload: DeleteClusterStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteClusterService extends ActionService {
  @Inject() deleteClusterAction: DeleteClusterAction

  @Mutation(() => ActionResult)
  deleteCluster(@Args('input') input: DeleteClusterInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Cluster',
      async (payload: DeleteClusterStatePayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteClusterAction.call(
          {
            uuid
          },
          { actionId, taskId }
        )
        return {
          id: uuid,
          inventory: {
            actionType: 'delete',
            id: uuid
          }
        }
      }
    )
    return {
      actionId
    }
  }
}
