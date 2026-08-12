import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateClusterDRSAction } from '@/api/zstack/UpdateClusterDRSAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateClusterDRSStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  state: string
}

@InputType()
class UpdateClusterDRSStateInput {
  @Field(() => UpdateClusterDRSStatePayload)
  payload: UpdateClusterDRSStatePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateClusterDRSStateService extends ActionService {
  @Inject() updateClusterDRSAction: UpdateClusterDRSAction

  @Mutation(() => ActionResult)
  updateClusterDRSState(@Args('input') input: UpdateClusterDRSStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ClusterDRS',
      async (payload: UpdateClusterDRSStatePayload, taskId: string) => {
        const action = { actionId, taskId }

        const result = await this.updateClusterDRSAction.call(
          {
            ...payload
          },
          action
        )

        return {
          id: actionId,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
