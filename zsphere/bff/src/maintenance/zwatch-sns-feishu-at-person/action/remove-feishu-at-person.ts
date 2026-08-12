import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RemoveSNSFeiShuAtPersonAction } from '@/api/zstack/RemoveSNSFeiShuAtPersonAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RemoveSNSFeiShuAtPersonPayload {
  @Field(() => String)
  userId: string

  @Field(() => String)
  endpointUuid: string
}

@InputType()
class RemoveSNSFeiShuAtPersonInput {
  @Field(() => [RemoveSNSFeiShuAtPersonPayload])
  payload: RemoveSNSFeiShuAtPersonPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveSNSFeiShuAtPersonService extends ActionService {
  @Inject() removeAction: RemoveSNSFeiShuAtPersonAction

  @Mutation(() => ActionResult)
  removeSNSFeiShuAtPerson(@Args('input') input: RemoveSNSFeiShuAtPersonInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SNSFeiShuAtPerson',
      async (payload: RemoveSNSFeiShuAtPersonPayload, taskId: string) => {
        await this.removeAction.call(payload, { actionId, taskId })
        return {
          id: payload.endpointUuid
        }
      },
      {
        listenerType: 'MutateSNSFeiShuAtPerson'
      }
    )
    return { actionId }
  }
}
