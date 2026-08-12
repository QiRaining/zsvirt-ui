import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { SNSEmailTestConnectionAction } from '@/api/zstack/SNSEmailTestConnectionAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SNSEmailTestConnectionPayload {
  @Field(() => String)
  platformUuid: string

  @Field(() => [String])
  emails: string[]
}

@InputType()
class SNSEmailTestConnectionInput {
  @Field(() => [SNSEmailTestConnectionPayload])
  payload: SNSEmailTestConnectionPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SNSEmailTestConnectionService extends ActionService {
  @Inject() snsEmailTestConnectionAction: SNSEmailTestConnectionAction

  @Mutation(() => ActionResult)
  snsEmailTestConnection(@Args('input') input: SNSEmailTestConnectionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPoint',
      async (payload: SNSEmailTestConnectionPayload, taskId: string) => {
        await this.snsEmailTestConnectionAction.call(
          {
            platformUuid: payload.platformUuid,
            emails: payload.emails,
            subject: '[Test]',
            text: 'this is a test message'
          },
          {
            actionId,
            taskId
          }
        )
        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
