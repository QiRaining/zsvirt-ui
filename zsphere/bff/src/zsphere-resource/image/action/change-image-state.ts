import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeImageStateAction, ChangeImageStateResult } from '@/api/zstack/ChangeImageStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { ImageStateEvent } from '../image.model'

@InputType()
class ChangeImageStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => ImageStateEvent)
  stateEvent: ImageStateEvent
}

@InputType()
class ChangeImageStateInput {
  @Field(() => [ChangeImageStatePayload])
  payload: ChangeImageStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeImageStateService extends ActionService {
  @Inject() changeImageStateAction: ChangeImageStateAction

  @Mutation(() => ActionResult)
  changeImageState(@Args('input') input: ChangeImageStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload: ChangeImageStatePayload, taskId: string) => {
      const result: ChangeImageStateResult = await this.changeImageStateAction.call(
        { ...payload },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        fields: 'state,lastOpDate',
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
