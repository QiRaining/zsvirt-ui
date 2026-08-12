import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddSNSWeComAtPersonAction } from '@/api/zstack/AddSNSWeComAtPersonAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddSNSWeComAtPersonPayload {
  @Field(() => String)
  userId: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => String, { nullable: true })
  remark?: string
}

@InputType()
class AddSNSWeComAtPersonInput {
  @Field(() => [AddSNSWeComAtPersonPayload])
  payload: AddSNSWeComAtPersonPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddSNSWeComAtPersonService extends ActionService {
  @Inject() addAction: AddSNSWeComAtPersonAction

  @Mutation(() => ActionResult)
  addSNSWeComAtPerson(@Args('input') input: AddSNSWeComAtPersonInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SNSWeComAtPerson',
      async (payload: AddSNSWeComAtPersonPayload, taskId: string) => {
        const resp = await this.addAction.call(payload, { actionId, taskId })

        return {
          id: resp.inventory?.uuid,
          inventory: resp.inventory
        }
      },
      {
        listenerType: 'MutateSNSWeComAtPerson'
      }
    )
    return { actionId }
  }
}
