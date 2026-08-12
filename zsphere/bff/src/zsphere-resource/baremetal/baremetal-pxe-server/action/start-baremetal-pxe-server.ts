import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { StartBaremetalPxeServerAction } from '@/api/zstack/StartBaremetalPxeServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class StartBaremetalPxeServerPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class StartBaremetalPxeServerInput {
  @Field(() => [StartBaremetalPxeServerPayload])
  payload: StartBaremetalPxeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class StartBaremetalPxeServerService extends ActionService {
  @Inject() startBaremetalPxeServerAction: StartBaremetalPxeServerAction

  @Mutation(() => ActionResult)
  startBaremetalPxeServer(@Args('input') input: StartBaremetalPxeServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalPxeServer',
      async (payload: StartBaremetalPxeServerPayload, taskId: string) => {
        const { uuid } = payload
        const result = await this.startBaremetalPxeServerAction.call({ uuid }, { actionId, taskId })
        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
