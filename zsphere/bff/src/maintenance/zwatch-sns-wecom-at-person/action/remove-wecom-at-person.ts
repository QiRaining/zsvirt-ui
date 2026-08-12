import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RemoveSNSWeComAtPersonAction } from '@/api/zstack/RemoveSNSWeComAtPersonAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RemoveSNSWeComAtPersonPayload {
  @Field(() => String)
  userId: string

  @Field(() => String)
  endpointUuid: string
}

@InputType()
class RemoveSNSWeComAtPersonInput {
  @Field(() => [RemoveSNSWeComAtPersonPayload])
  payload: RemoveSNSWeComAtPersonPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveSNSWeComAtPersonService extends ActionService {
  @Inject() removeAction: RemoveSNSWeComAtPersonAction

  @Mutation(() => ActionResult)
  removeSNSWeComAtPerson(@Args('input') input: RemoveSNSWeComAtPersonInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SNSWeComAtPerson',
      async (payload: RemoveSNSWeComAtPersonPayload, taskId: string) => {
        const { endpointUuid } = payload
        await this.removeAction.call(payload, { actionId, taskId })
        return {
          id: endpointUuid
        }
      },
      {
        listenerType: 'MutateSNSWeComAtPerson'
      }
    )
    return { actionId }
  }
}
