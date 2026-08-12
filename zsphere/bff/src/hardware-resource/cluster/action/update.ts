import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateClusterAction, UpdateClusterResult } from '@/api/zstack/UpdateClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateClusterPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class UpdateClusterInput {
  @Field(() => UpdateClusterPayload)
  payload: UpdateClusterPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateClusterService extends ActionService {
  @Inject() updateClusterAction: UpdateClusterAction

  @Mutation(() => ActionResult)
  updateCluster(@Args('input') input: UpdateClusterInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Cluster', async (payload: UpdateClusterPayload, taskId: string) => {
      const { uuid, name, description } = payload
      const result: UpdateClusterResult = await this.updateClusterAction.call(
        {
          uuid,
          name,
          description
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        fields: 'name,description,lastOpDate',
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
