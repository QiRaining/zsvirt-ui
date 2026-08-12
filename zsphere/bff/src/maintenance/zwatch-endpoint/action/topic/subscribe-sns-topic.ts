import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SubscribeSNSTopicAction } from '@/api/zstack/SubscribeSNSTopicAction'
import { ActionService } from '@/base/action-service'
import { ActionResult } from '@/common/model/action.model'

@InputType()
class SubscribeSNSTopicInput {
  @Field(() => String)
  topicUuid: string

  @Field(() => String)
  endpointUuid: string
}

export class SubscribeSNSTopicService extends ActionService {
  @Inject() subscribeSNSTopicAction: SubscribeSNSTopicAction

  @Mutation(() => ActionResult)
  async subscribeSNSTopic(
    input: SubscribeSNSTopicInput,
    actionInfo?: { actionId?: string; taskId?: string }
  ) {
    const { topicUuid, endpointUuid } = input
    await this.subscribeSNSTopicAction.call(
      { topicUuid, endpointUuid },
      { actionId: actionInfo?.actionId, taskId: actionInfo?.taskId }
    )
    return {
      id: input.endpointUuid
    }
  }
}
