import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddHybridKeySecretAction } from '@/api/zstack/AddHybridKeySecretAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateSNSAliyunSmsEndpointAction } from '@/api/zstack/CreateSNSAliyunSmsEndpointAction'
import { ActionService } from '@/base/action-service'
import { Op } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'

import { CreateSNSTopicService } from './topic/create-sns-topic'
import { SubscribeSNSTopicService } from './topic/subscribe-sns-topic'

@InputType()
class CreateAliyunSmsEndpointPayload {
  @Field(() => String)
  accessKeyUuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  receivers?: string[]
}

@InputType()
class CreateAliyunSmsEndpointAndAccesskeyPayload {
  @Field(() => String)
  accessKey: string

  @Field(() => String)
  secret: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  receivers?: string[]
}

@InputType()
class CreateAliyunSmsEndpointInput {
  @Field(() => [CreateAliyunSmsEndpointPayload])
  payload: CreateAliyunSmsEndpointPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class CreateAliyunSmsEndpointAndAccesskeyInput {
  @Field(() => [CreateAliyunSmsEndpointAndAccesskeyPayload])
  payload: CreateAliyunSmsEndpointAndAccesskeyPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateAliyunSmsEndpointService extends ActionService {
  @Inject() createAction: CreateSNSAliyunSmsEndpointAction
  @Inject() createSNSTopicService: CreateSNSTopicService
  @Inject() subscribeSNSTopicService: SubscribeSNSTopicService
  @Inject() createHybridKeySecretAction: AddHybridKeySecretAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  createAliyunSmsEndpoint(@Args('input') input: CreateAliyunSmsEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AliyunSmsEndPoint',
      async (payload: CreateAliyunSmsEndpointPayload, taskId: string) => {
        return await this._createAliyunSmsEndpointasync(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  @Mutation(() => ActionResult)
  createAliyunSmsEndpointAndAccesskey(
    @Args('input') input: CreateAliyunSmsEndpointAndAccesskeyInput
  ) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AliyunSmsEndPoint',
      async (payload: CreateAliyunSmsEndpointAndAccesskeyPayload, taskId: string) => {
        let createEndpointRespId
        //先获取/创建accesskeyuuid，再创建AliyunSmsEndpoint
        const accessKey = await this.getAccessKey(payload, taskId, actionId)
        if (accessKey?.uuid) {
          createEndpointRespId = await this._createAliyunSmsEndpointasync(
            {
              ...payload,
              accessKeyUuid: accessKey?.uuid
            },
            taskId,
            actionId
          )
        }
        return { id: createEndpointRespId?.id }
      }
    )
    return { actionId }
  }

  async getAccessKey(
    payload: CreateAliyunSmsEndpointAndAccesskeyPayload,
    taskId: string,
    actionId: string
  ) {
    //先查对应表，看是否已经存在对应id，存在就用之前的，不存在再创建
    const zql = ZQL.stringify({
      tableName: 'HybridAccount',
      condition: {
        akey: {
          [Op.eq]: payload.accessKey
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    if (resp?.results?.[0]?.inventories?.[0]) {
      return resp?.results?.[0]?.inventories?.[0]
    }

    return (
      await this.createHybridKeySecretAction.call(
        {
          name: 'frontEndAutomaticallyGenerated',
          type: 'AliyunSms',
          key: payload.accessKey,
          secret: payload.secret
        },
        { actionId, taskId }
      )
    )?.inventory
  }

  async _createAliyunSmsEndpointasync(
    payload: CreateAliyunSmsEndpointPayload,
    taskId: string,
    actionId: string
  ) {
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
}
