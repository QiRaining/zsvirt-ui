import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateHostIommuStateAction } from '@/api/zstack/UpdateHostIommuStateAction'
import { ActionService } from '@/base/action-service'
import { State } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CloseHostIommuPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class CloseHostIommuInput {
  @Field(() => CloseHostIommuPayload)
  payload: CloseHostIommuPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CloseHostIommuService extends ActionService {
  @Inject() updateHostIommuStateAction: UpdateHostIommuStateAction

  @Mutation(() => ActionResult)
  closeHostIommu(@Args('input') input: CloseHostIommuInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: CloseHostIommuPayload, taskId: string) => {
      const { uuid } = payload
      await this.updateHostIommuStateAction.call(
        {
          uuid,
          state: State.Disabled
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid
      }
    })
    return { actionId }
  }
}
