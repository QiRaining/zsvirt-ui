import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteSNSApplicationEndpointAction } from '@/api/zstack/DeleteSNSApplicationEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { DeleteSNSTopicService } from './topic/delete-sns-topic'
import { UnsubscribeSNSTopicService } from './topic/unsubscribe-sns-topic'

@InputType()
class DeleteEndpointPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  topicUuid?: string
}

@InputType()
class DeleteEndpointInput {
  @Field(() => [DeleteEndpointPayload])
  payload: DeleteEndpointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteEndpointService extends ActionService {
  @Inject() deleteAction: DeleteSNSApplicationEndpointAction
  @Inject() unsubscribeSNSTopicService: UnsubscribeSNSTopicService
  @Inject() deleteSNSTopicService: DeleteSNSTopicService

  @Mutation(() => ActionResult)
  deleteSNSApplicationEndpoint(@Args('input') input: DeleteEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'EndPoint', async (payload: DeleteEndpointPayload, taskId: string) => {
      const { uuid, topicUuid } = payload
      if (topicUuid) {
        await this.unsubscribeSNSTopicService.unubscribeSNSTopic(
          {
            topicUuid,
            endpointUuid: uuid
          },
          {
            actionId,
            taskId
          }
        )
        await this.deleteSNSTopicService.deleteSNSTopic({ uuid: topicUuid }, { actionId, taskId })
      }
      await this.deleteAction.call(payload, { actionId, taskId })
      return {
        id: uuid
      }
    })
    return { actionId }
  }
}
