import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AttachBaremetalPxeServerToClusterAction } from '@/api/zstack/AttachBaremetalPxeServerToClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AttachBaremetalPxeServerPayload {
  @Field(() => String)
  pxeServerUuid: string

  @Field(() => String)
  clusterUuid: string
}

@InputType()
class AttachBaremetalPxeServerInput {
  @Field(() => [AttachBaremetalPxeServerPayload])
  payload: AttachBaremetalPxeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachBaremetalPxeServerService extends ActionService {
  @Inject()
  attachBaremetalPxeServerToClusterAction: AttachBaremetalPxeServerToClusterAction

  @Mutation(() => ActionResult)
  attachBaremetalPxeServer(@Args('input') input: AttachBaremetalPxeServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalPxeServer',
      async (payload: AttachBaremetalPxeServerPayload, taskId: string) => {
        const { clusterUuid, pxeServerUuid } = payload
        await this.attachBaremetalPxeServerToClusterAction.call(
          { clusterUuid, pxeServerUuid },
          { actionId, taskId }
        )
        return {
          id: payload.pxeServerUuid
        }
      }
    )
    return { actionId }
  }
}
