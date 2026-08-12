import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeAccessKeyStateAction } from '@/api/zstack/ChangeAccessKeyStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeAccessKeyStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  stateEvent: string
}

@InputType()
class ChangeAccessKeyStateInput {
  @Field(() => [ChangeAccessKeyStatePayload])
  payload: ChangeAccessKeyStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeAccessKeyStateService extends ActionService {
  @Inject() changeAccessKeyStateAction: ChangeAccessKeyStateAction

  @Mutation(() => ActionResult)
  changeAccessKeyState(@Args('input') input: ChangeAccessKeyStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccessKey',
      async (payload: ChangeAccessKeyStatePayload, taskId: string) => {
        const { uuid, stateEvent } = payload
        await this.changeAccessKeyStateAction.call({ uuid, stateEvent }, { actionId, taskId })
        return {
          id: payload.uuid,
          fields: 'state'
        }
      }
    )
    return { actionId }
  }
}
