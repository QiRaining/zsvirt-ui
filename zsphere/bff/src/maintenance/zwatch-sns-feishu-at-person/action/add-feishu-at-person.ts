import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddSNSFeiShuAtPersonAction } from '@/api/zstack/AddSNSFeiShuAtPersonAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddSNSFeiShuAtPersonPayload {
  @Field(() => String)
  userId: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => String, { nullable: true })
  remark?: string
}

@InputType()
class AddSNSFeiShuAtPersonInput {
  @Field(() => [AddSNSFeiShuAtPersonPayload])
  payload: AddSNSFeiShuAtPersonPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddSNSFeiShuAtPersonService extends ActionService {
  @Inject() addAction: AddSNSFeiShuAtPersonAction

  @Mutation(() => ActionResult)
  addSNSFeiShuAtPerson(@Args('input') input: AddSNSFeiShuAtPersonInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SNSFeiShuAtPerson',
      async (payload: AddSNSFeiShuAtPersonPayload, taskId: string) => {
        const resp = await this.addAction.call(payload, { actionId, taskId })

        return {
          id: resp.inventory?.uuid,
          inventory: resp.inventory
        }
      },
      {
        listenerType: 'MutateSNSFeiShuAtPerson'
      }
    )
    return { actionId }
  }
}
