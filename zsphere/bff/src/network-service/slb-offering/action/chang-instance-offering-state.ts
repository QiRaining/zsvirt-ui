import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ChangeInstanceOfferingStateAction,
  ChangeInstanceOfferingStateResult
} from '@/api/zstack/ChangeInstanceOfferingStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeSlbOfferingStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  stateEvent: string
}

@InputType()
export class ChangeSlbOfferingStateInput {
  @Field(() => [ChangeSlbOfferingStatePayload])
  payload: ChangeSlbOfferingStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeSlbOfferingStateService extends ActionService {
  @Inject() ChangeSlbOfferingStateAction: ChangeInstanceOfferingStateAction

  @Mutation(() => ActionResult)
  changeSlbOfferingState(@Args('input') input: ChangeSlbOfferingStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SlbOffering',
      async (payload: ChangeSlbOfferingStatePayload, taskId: string) => {
        const { uuid, stateEvent } = payload
        const result: ChangeInstanceOfferingStateResult =
          await this.ChangeSlbOfferingStateAction.call({ uuid, stateEvent }, { actionId, taskId })
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
