import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { SubscribeEventAction, SubscribeEventResult } from '@/api/zstack/SubscribeEventAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'

import { AlarmActionsInput, AlarmLabelsInput } from './create-alarm'

@InputType()
export class SubscribeEventPayload {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  zhName?: string

  @Field(() => [AlarmActionsInput], { nullable: true })
  actions: AlarmActionsInput[]

  @Field(() => Boolean, { nullable: true, description: '开启恢复通知' })
  enableRecovery: boolean

  @Field(() => String, { nullable: true, description: '报警等级' })
  emergencyLevel: string

  @Field(() => String, { description: '名字空间' })
  namespace: string

  @Field(() => [AlarmLabelsInput], { nullable: true, description: '标签列表' })
  labels: AlarmLabelsInput[]

  @Field(() => String, { nullable: true })
  eventName: string

  @Field(() => String, { nullable: true })
  resourceUuid: string
}

@InputType()
class SubscribeEventInput {
  @Field(() => SubscribeEventPayload)
  payload: SubscribeEventPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SubscribeEventService extends ActionService {
  @Inject() subscribeEventAction: SubscribeEventAction
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() zqlService: ZQLService

  // 订阅事件（创建事件报警器、创建第三方报警器）
  @Mutation(() => ActionResult)
  subscribeEvent(@Args('input') input: SubscribeEventInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: SubscribeEventPayload, taskId: string) => {
        let result: SubscribeEventResult
        const { zhName, ...param } = payload
        if (param.namespace === 'ZStack/DisasterRecoveryStorage') {
          result = await this.subscribeEventAction.call(
            { ...param, namespace: 'ZStack/BackupStorage' },
            { actionId, taskId }
          )
          await this.createSystemTagAction.call(
            {
              resourceType: 'EventSubscriptionVO',
              resourceUuid: result.inventory.uuid,
              tag: 'resourceName::DisasterRecoveryStorage'
            },
            { actionId, taskId }
          )
        } else {
          result = await this.subscribeEventAction.call({ ...param }, { actionId, taskId })
        }
        if (zhName) {
          const { results = [] } = await this.zqlService.call(
            ZQL.stringify({
              tableName: 'SystemTag',
              condition: {
                resourceType: 'EventSubscriptionVO',
                resourceUuid: result.inventory.uuid,
                tag: {
                  [ZOp.like]: 'name::cn::%'
                }
              }
            })
          )
          const uuid = results[0]?.inventories?.[0]?.uuid
          if (uuid) {
            this.updateSystemTagAction.call(
              { uuid, tag: `name::cn::${zhName}` },
              { actionId, taskId }
            )
          } else {
            this.createSystemTagAction.call(
              {
                resourceType: 'EventSubscriptionVO',
                resourceUuid: result.inventory.uuid,
                tag: `name::cn::${zhName}`
              },
              { actionId, taskId }
            )
          }
        }
        return {
          id: result.inventory.uuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
