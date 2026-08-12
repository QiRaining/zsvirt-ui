import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddSNSDingTalkAtPersonAction } from '@/api/zstack/AddSNSDingTalkAtPersonAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddSNSDingTalkAtPersonPayload {
  @Field(() => String)
  phoneNumber: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => String, { nullable: true })
  remark?: string
}

@InputType()
class AddSNSDingTalkAtPersonInput {
  @Field(() => [AddSNSDingTalkAtPersonPayload])
  payload: AddSNSDingTalkAtPersonPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddSNSDingTalkAtPersonService extends ActionService {
  @Inject() addAction: AddSNSDingTalkAtPersonAction

  @Mutation(() => ActionResult)
  addSNSDingTalkAtPerson(@Args('input') input: AddSNSDingTalkAtPersonInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SNSDingTalkAtPerson',
      async (payload: AddSNSDingTalkAtPersonPayload, taskId: string) => {
        const resp = await this.addAction.call(payload, { actionId, taskId })

        return {
          id: resp.inventory?.uuid,
          inventory: resp.inventory
        }
      },
      {
        listenerType: 'MutateSNSDingTalkAtPerson'
      }
    )
    return { actionId }
  }
}
