import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteBaremetalPxeServerAction } from '@/api/zstack/DeleteBaremetalPxeServerAction'
import { DetachBaremetalPxeServerFromClusterAction } from '@/api/zstack/DetachBaremetalPxeServerFromClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DetachBaremetalPxeServerPayload {
  @Field(() => String)
  pxeServerUuid: string

  @Field(() => Boolean, { defaultValue: false })
  deletePxeServer: boolean

  @Field(() => String)
  clusterUuid: string
}

@InputType()
class DetachBaremetalPxeServerInput {
  @Field(() => [DetachBaremetalPxeServerPayload])
  payload: DetachBaremetalPxeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachBaremetalPxeServerService extends ActionService {
  @Inject()
  detachBaremetalPxeServerToClusterAction: DetachBaremetalPxeServerFromClusterAction

  @Inject()
  deleteBaremetalPxeServerAction: DeleteBaremetalPxeServerAction

  @Mutation(() => ActionResult)
  detachBaremetalPxeServer(@Args('input') input: DetachBaremetalPxeServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalPxeServer',
      async (payload: DetachBaremetalPxeServerPayload, taskId: string) => {
        const { clusterUuid, pxeServerUuid } = payload
        await this.detachBaremetalPxeServerToClusterAction.call(
          { clusterUuid, pxeServerUuid },
          { actionId, taskId }
        )
        if (payload.deletePxeServer) {
          await this.deleteBaremetalPxeServerAction.call(
            { uuid: pxeServerUuid },
            { actionId, taskId }
          )
        }
        return {
          id: payload.pxeServerUuid
        }
      }
    )
    return { actionId }
  }
}
