import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSNSWeComEndpointAction } from '@/api/zstack/CreateSNSWeComEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CreateSNSTopicService } from './topic/create-sns-topic'
import { SubscribeSNSTopicService } from './topic/subscribe-sns-topic'

@InputType()
class CreateWeComEndpointPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { description: '地址' })
  url: string

  @Field(() => Boolean, { nullable: true, description: '是否指定所有人' })
  atAll?: boolean

  /** 指定人 **/
  @Field(() => [String], {
    nullable: true,
    description: '指定用户的id, 兼容以前的sdk，所以留着'
  })
  atPersonUserIds?: string[]

  @Field(() => String, {
    nullable: true,
    description: 'JSON字符串格式: "{176729282: 李四}", key 为手机号，value为备注'
  })
  atPersonList?: string

  @Field(() => String, { nullable: true })
  locale?: string
}

@InputType()
class CreateWeComEndpointInput {
  @Field(() => [CreateWeComEndpointPayload])
  payload: CreateWeComEndpointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateWeComEndpointService extends ActionService {
  @Inject() createAction: CreateSNSWeComEndpointAction
  @Inject() createSNSTopicService: CreateSNSTopicService
  @Inject() subscribeSNSTopicService: SubscribeSNSTopicService

  @Mutation(() => ActionResult)
  createWeComEndpoint(@Args('input') input: CreateWeComEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'WeComEndPoint',
      async (payload: CreateWeComEndpointPayload, taskId: string) => {
        let createEndpointResp
        const { createSnsInventory } = await this.createSNSTopicService.createSNSTopic(
          {
            name: payload.name,
            description: payload.description,
            locale: payload.locale
          },
          {
            actionId,
            taskId
          }
        )
        if (createSnsInventory?.uuid) {
          try {
            // 转换成后端需要的最简设要求的数据结构：{'176729282': '李四'}
            payload.atPersonList = JSON.parse(payload.atPersonList)
          } catch (error) {}

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
