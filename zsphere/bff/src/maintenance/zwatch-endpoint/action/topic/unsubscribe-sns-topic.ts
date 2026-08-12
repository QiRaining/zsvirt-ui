import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UnsubscribeSNSTopicAction } from '@/api/zstack/UnsubscribeSNSTopicAction'
import { ActionService } from '@/base/action-service'
import { ActionResult } from '@/common/model/action.model'

@InputType()
class UnsubscribeSNSTopicInput {
  @Field(() => String)
  topicUuid: string

  @Field(() => String)
  endpointUuid: string
}

export class UnsubscribeSNSTopicService extends ActionService {
  @Inject() unubscribeSNSTopicAction: UnsubscribeSNSTopicAction

  @Mutation(() => ActionResult)
  async unubscribeSNSTopic(
    input: UnsubscribeSNSTopicInput,
    actionInfo?: { actionId?: string; taskId?: string }
  ) {
    const { topicUuid, endpointUuid } = input
    await this.unubscribeSNSTopicAction.call(
      { topicUuid, endpointUuid },
      { actionId: actionInfo?.actionId, taskId: actionInfo?.taskId }
    )
    return {
      id: endpointUuid
    }
  }
}
