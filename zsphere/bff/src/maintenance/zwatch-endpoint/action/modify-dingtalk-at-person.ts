import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddSNSDingTalkAtPersonAction } from '@/api/zstack/AddSNSDingTalkAtPersonAction'
import { RemoveSNSDingTalkAtPersonAction } from '@/api/zstack/RemoveSNSDingTalkAtPersonAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ModifyDingTalkAtPersonPayload {
  @Field(() => [String])
  oldPhoneNumbers: string[]

  @Field(() => [String])
  phoneNumbers: string[]

  @Field(() => String)
  endpointUuid: string
}

@InputType()
class ModifyDingTalkAtPersonInput {
  @Field(() => ModifyDingTalkAtPersonPayload)
  payload: ModifyDingTalkAtPersonPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ModifyDingTalkAtPersonService extends ActionService {
  @Inject() addSNSDingTalkAtPersonAction: AddSNSDingTalkAtPersonAction
  @Inject() removeSNSDingTalkAtPersonAction: RemoveSNSDingTalkAtPersonAction

  @Mutation(() => ActionResult)
  modifyDingTalkAtPerson(@Args('input') input: ModifyDingTalkAtPersonInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPoint',
      async (payload: ModifyDingTalkAtPersonPayload, taskId: string) => {
        const { endpointUuid } = payload
        await Promise.all(
          payload?.oldPhoneNumbers?.map((it: string) =>
            this.removeSNSDingTalkAtPersonAction.call(
              {
                phoneNumber: it,
                endpointUuid
              },
              { actionId, taskId }
            )
          )
        )
        await Promise.all(
          payload?.phoneNumbers?.map((it: string) =>
            this.addSNSDingTalkAtPersonAction.call(
              {
                phoneNumber: it,
                endpointUuid
              },
              { actionId, taskId }
            )
          )
        )

        return {
          id: endpointUuid
        }
      }
    )
    return { actionId }
  }
}
