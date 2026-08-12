import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SNSSnmpTestConnectionAction } from '@/api/zstack/SNSSnmpTestConnectionAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SNSSnmpTestConnectionPayload {
  @Field(() => String, { nullable: true })
  platformUuid: string

  @Field(() => String, { nullable: true })
  endpointUuid: string
}

@InputType()
class SNSSnmpTestConnectionInput {
  @Field(() => [SNSSnmpTestConnectionPayload])
  payload: SNSSnmpTestConnectionPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SNSSnmpTestConnectionService extends ActionService {
  @Inject() snsSnmpTestConnectionAction: SNSSnmpTestConnectionAction

  @Mutation(() => ActionResult)
  snsSnmpTestConnection(@Args('input') input: SNSSnmpTestConnectionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPoint',
      async (payload: SNSSnmpTestConnectionPayload, taskId: string) => {
        await this.snsSnmpTestConnectionAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
