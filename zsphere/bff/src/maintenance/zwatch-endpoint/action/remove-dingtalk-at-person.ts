import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RemoveSNSDingTalkAtPersonAction } from '@/api/zstack/RemoveSNSDingTalkAtPersonAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RemoveSNSDingTalkAtPersonPayload {
  @Field(() => String)
  phoneNumber: string

  @Field(() => String)
  endpointUuid: string
}

@InputType()
class RemoveSNSDingTalkAtPersonInput {
  @Field(() => [RemoveSNSDingTalkAtPersonPayload])
  payload: RemoveSNSDingTalkAtPersonPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveSNSDingTalkAtPersonService extends ActionService {
  @Inject() removeAction: RemoveSNSDingTalkAtPersonAction

  @Mutation(() => ActionResult)
  removeSNSDingTalkAtPerson(@Args('input') input: RemoveSNSDingTalkAtPersonInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPoint',
      async (payload: RemoveSNSDingTalkAtPersonPayload, taskId: string) => {
        const { endpointUuid } = payload
        await this.removeAction.call(payload, { actionId, taskId })
        return {
          id: endpointUuid
        }
      }
    )
    return { actionId }
  }
}
