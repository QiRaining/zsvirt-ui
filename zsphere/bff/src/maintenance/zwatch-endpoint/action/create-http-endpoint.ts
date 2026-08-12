import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSNSHttpEndpointAction } from '@/api/zstack/CreateSNSHttpEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CreateSNSTopicService } from './topic/create-sns-topic'
import { SubscribeSNSTopicService } from './topic/subscribe-sns-topic'

@InputType()
class CreateHttpEndpointPayload {
  @Field(() => String)
  url: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  password?: string
}

@InputType()
class CreateHttpEndpointInput {
  @Field(() => [CreateHttpEndpointPayload])
  payload: CreateHttpEndpointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateHttpEndpointService extends ActionService {
  @Inject() createAction: CreateSNSHttpEndpointAction
  @Inject() createSNSTopicService: CreateSNSTopicService
  @Inject() subscribeSNSTopicService: SubscribeSNSTopicService

  @Mutation(() => ActionResult)
  createHttpEndpoint(@Args('input') input: CreateHttpEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HttpEndPoint',
      async (payload: CreateHttpEndpointPayload, taskId: string) => {
        let createEndpointResp
        const { createSnsInventory } = await this.createSNSTopicService.createSNSTopic(
          {
            name: payload.name,
            description: payload.description
          },
          {
            actionId,
            taskId
          }
        )
        if (createSnsInventory?.uuid) {
          createEndpointResp = await this.createAction.call(payload, {
            actionId,
            taskId
          })
        }
        if (createEndpointResp?.inventory?.uuid) {
          await this.subscribeSNSTopicService.subscribeSNSTopic(
            {
              topicUuid: createSnsInventory?.uuid,
              endpointUuid: createEndpointResp?.inventory.uuid
            },
            {
              actionId,
              taskId
            }
          )
        }
        return {
          id: createEndpointResp?.inventory.uuid
        }
      }
    )
    return { actionId }
  }
}
