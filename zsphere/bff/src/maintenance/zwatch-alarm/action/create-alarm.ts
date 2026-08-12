import { Inject } from '@nestjs/common'
import { Args, Field, Float, InputType, Int, Mutation } from '@nestjs/graphql'

import { CreateAlarmAction, CreateAlarmResult } from '@/api/zstack/CreateAlarmAction'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ComparisonOperator } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AlarmActionsInput {
  @Field(() => String, { nullable: true })
  alarmUuid: string

  @Field(() => String)
  actionType: string

  @Field(() => String)
  actionUuid: string
}

@InputType()
export class AlarmLabelsInput {
  @Field(() => String)
  key: string

  @Field(() => String)
  op: string

  @Field(() => String)
  value: string
}

@InputType()
export class CreateAlarmPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => [AlarmActionsInput], { nullable: true })
  actions: AlarmActionsInput[]

  @Field(() => ComparisonOperator, { description: '阈值比较符' })
  comparisonOperator: ComparisonOperator

  @Field(() => Boolean, { nullable: true, description: '开启恢复通知' })
  enableRecovery: boolean

  @Field(() => String, { nullable: true, description: '报警等级' })
  emergencyLevel: string

  @Field(() => String, { description: '监控项名' })
  metricName: string

  @Field(() => String, { description: '名字空间' })
  namespace: string

  @Field(() => [AlarmLabelsInput], { nullable: true, description: '标签列表' })
  labels: AlarmLabelsInput[]

  @Field(() => Int, { nullable: true, description: '阈值持续时间' })
  period: number

  @Field(() => Float, { description: '阈值' })
  threshold: number

  @Field(() => Int, { nullable: true, description: '报警重复时间' })
  repeatInterval: number

  @Field(() => Int, { nullable: true, description: '报警重复次数' })
  repeatCount: number

  @Field(() => String, { nullable: true })
  resourceUuid: string

  @Field(() => String, { nullable: true, description: '报警器类型' })
  type: string
}

@InputType()
export class CreateUserTagInput {
  @Field(() => String)
  resourceType: string

  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  tag: string
}

@InputType()
class CreateAlarmInput {
  @Field(() => CreateAlarmPayload)
  payload: CreateAlarmPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateAlarmService extends ActionService {
  @Inject() createAlarmAction: CreateAlarmAction

  @Inject() createSystemTagAction: CreateSystemTagAction

  @Mutation(() => ActionResult)
  createAlarm(@Args('input') input: CreateAlarmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ZWatchAlarmVO',
      async (payload: CreateAlarmPayload, taskId: string) => {
        let result: CreateAlarmResult
        if (payload.namespace === 'ZStack/DisasterRecoveryStorage') {
          result = await this.createAlarmAction.call(
            { ...payload, namespace: 'ZStack/BackupStorage' },
            { actionId, taskId }
          )
          await this.createSystemTagAction.call(
            {
              resourceType: 'AlarmVO',
              resourceUuid: result.inventory.uuid,
              tag: 'resourceName::DisasterRecoveryStorage'
            },
            { actionId, taskId }
          )
        } else {
          result = await this.createAlarmAction.call(payload, {
            actionId,
            taskId
          })
        }
        // 同步创建中文名 systemTag, 为了中英文搜索
        await this.createSystemTagAction.call(
          {
            resourceType: 'AlarmVO',
            resourceUuid: result.inventory.uuid,
            tag: `name::cn::${payload?.name}`
          },
          { actionId, taskId }
        )
        return {
          id: result.inventory.uuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
