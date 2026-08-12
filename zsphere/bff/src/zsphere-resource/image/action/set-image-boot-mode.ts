import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetImageBootModeAction } from '@/api/zstack/SetImageBootModeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { ImageBootMode } from '../image.model'

@InputType()
class SetImageBootModePayload {
  @Field(() => String)
  uuid: string

  @Field(() => ImageBootMode)
  bootMode: ImageBootMode
}

@InputType()
class SetImageBootModeInput {
  @Field(() => [SetImageBootModePayload])
  payload: SetImageBootModePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetImageBootModeService extends ActionService {
  @Inject() setImageBootModeAction: SetImageBootModeAction

  @Mutation(() => ActionResult)
  setImageBootMode(@Args('input') input: SetImageBootModeInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload: SetImageBootModePayload, taskId: string) => {
      await this.setImageBootModeAction.call(
        {
          ...payload
        },
        { actionId, taskId }
      )
      return {
        id: payload.uuid,
        fields: 'bootMode',
        inventory: { bootMode: payload.bootMode }
      }
    })
    return { actionId }
  }
}
