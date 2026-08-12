import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateHostIommuStateAction } from '@/api/zstack/UpdateHostIommuStateAction'
import { ActionService } from '@/base/action-service'
import { State } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class OpenHostIommuPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class OpenHostIommuInput {
  @Field(() => OpenHostIommuPayload)
  payload: OpenHostIommuPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class OpenHostIommuService extends ActionService {
  @Inject() updateHostIommuStateAction: UpdateHostIommuStateAction

  @Mutation(() => ActionResult)
  openHostIommu(@Args('input') input: OpenHostIommuInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: OpenHostIommuPayload, taskId: string) => {
      const { uuid } = payload
      await this.updateHostIommuStateAction.call(
        {
          uuid,
          state: State.Enabled
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
