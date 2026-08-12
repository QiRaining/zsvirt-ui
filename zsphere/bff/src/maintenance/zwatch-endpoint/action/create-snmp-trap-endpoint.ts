import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSNSSnmpEndpointAction } from '@/api/zstack/CreateSNSSnmpEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CreateSNSTopicService } from './topic/create-sns-topic'
import { SubscribeSNSTopicService } from './topic/subscribe-sns-topic'

@InputType()
class CreateSnmpTrapEndpointPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  platformUuid?: string
}

@InputType()
class CreateSnmpTrapEndpointInput {
  @Field(() => CreateSnmpTrapEndpointPayload)
  payload: CreateSnmpTrapEndpointPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateSnmpTrapEndpointService extends ActionService {
  @Inject() createAction: CreateSNSSnmpEndpointAction
  @Inject() createSNSTopicService: CreateSNSTopicService
  @Inject() subscribeSNSTopicService: SubscribeSNSTopicService

  @Mutation(() => ActionResult)
  createSnmpTrapEndpoint(@Args('input') input: CreateSnmpTrapEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnmpTrapEndPoint',
      async (payload: CreateSnmpTrapEndpointPayload, taskId: string) => {
        // ZSTAC-54356，创建邮箱、钉钉、Microsoftteams 通知对象时，topic 需要传入 locale
        const { name, description, ...params } = payload
        let createEndpointResp
        const { createSnsInventory } = await this.createSNSTopicService.createSNSTopic(
          {
            name,
            description
          },
          {
            actionId,
            taskId
          }
        )
        if (createSnsInventory?.uuid) {
          createEndpointResp = await this.createAction.call(
            {
              name,
              description,
              ...params
            },
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
