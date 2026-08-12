import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSNSEmailEndpointAction } from '@/api/zstack/CreateSNSEmailEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CreateSNSTopicService } from './topic/create-sns-topic'
import { SubscribeSNSTopicService } from './topic/subscribe-sns-topic'

@InputType()
class CreateEmailEndpointPayload {
  @Field(() => String, { nullable: true })
  email: string

  @Field(() => String)
  name: string

  @Field(() => [String], { nullable: true })
  emails: string[]

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  platformUuid?: string

  @Field(() => String, { nullable: true })
  locale?: string
}

@InputType()
class CreateEmailEndpointInput {
  @Field(() => [CreateEmailEndpointPayload])
  payload: CreateEmailEndpointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateEmailEndpointService extends ActionService {
  @Inject() createAction: CreateSNSEmailEndpointAction
  @Inject() createSNSTopicService: CreateSNSTopicService
  @Inject() subscribeSNSTopicService: SubscribeSNSTopicService

  @Mutation(() => ActionResult)
  createEmailEndpoint(@Args('input') input: CreateEmailEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EmailEndPoint',
      async (payload: CreateEmailEndpointPayload, taskId: string) => {
        // ZSTAC-54356，创建邮箱、钉钉、Microsoftteams 通知对象时，topic 需要传入 locale
        const { name, description, locale, ...params } = payload
        let createEndpointResp
        const { createSnsInventory } = await this.createSNSTopicService.createSNSTopic(
          {
            name,
            description,
            locale
          },
          {
            actionId,
            taskId
          }
        )
        if (createSnsInventory?.uuid) {
          createEndpointResp = await this.createAction.call(
            { name, description, ...params },
            {
              actionId,
              taskId
            }
          )
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
