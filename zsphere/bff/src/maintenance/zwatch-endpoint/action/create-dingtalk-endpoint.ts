import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSNSDingTalkEndpointAction } from '@/api/zstack/CreateSNSDingTalkEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CreateSNSTopicService } from './topic/create-sns-topic'
import { SubscribeSNSTopicService } from './topic/subscribe-sns-topic'

@InputType()
class CreateDingTalkEndpointPayload {
  @Field(() => String)
  url: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { nullable: true })
  atAll?: boolean

  @Field(() => [String], {
    nullable: true,
    description: '指定用户手机号, 兼容以前的sdk，所以留着'
  })
  atPersonPhoneNumbers?: string[]

  @Field(() => String, {
    nullable: true,
    description: 'JSON字符串格式: "{176729282: 李四}", key 为手机号，value为备注'
  })
  atPersonList?: string

  @Field(() => String, {
    description: '密钥, 填空字符串表示 安全设置为：无'
  })
  secret: string

  @Field(() => String, { nullable: true })
  locale?: string
}

@InputType()
class CreateDingTalkEndpointInput {
  @Field(() => [CreateDingTalkEndpointPayload])
  payload: CreateDingTalkEndpointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateDingTalkEndpointService extends ActionService {
  @Inject() createAction: CreateSNSDingTalkEndpointAction
  @Inject() createSNSTopicService: CreateSNSTopicService
  @Inject() subscribeSNSTopicService: SubscribeSNSTopicService

  @Mutation(() => ActionResult)
  createDingTalkEndpoint(@Args('input') input: CreateDingTalkEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'DingTalkEndPoint',
      async (payload: CreateDingTalkEndpointPayload, taskId: string) => {
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
          try {
            // 转换成后端需要的最简设要求的数据结构：{'176729282': '李四'}
            params.atPersonList = JSON.parse(params.atPersonList)
          } catch (error) {}

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
              endpointUuid: createEndpointResp?.inventory?.uuid
            },
            {
              actionId,
              taskId
            }
          )
        }
        return {
          id: createEndpointResp?.inventory?.uuid
        }
      }
    )
    return { actionId }
  }
}
