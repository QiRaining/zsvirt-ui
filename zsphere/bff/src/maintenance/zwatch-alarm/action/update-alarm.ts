import { Inject } from '@nestjs/common'
import { Args, Field, Float, InputType, Mutation } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { RemoveActionFromAlarmAction } from '@/api/zstack/RemoveActionFromAlarmAction'
import { UpdateAlarmAction } from '@/api/zstack/UpdateAlarmAction'
import { UpdateAlarmLabelAction } from '@/api/zstack/UpdateAlarmLabelAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ComparisonOperator } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'

import { RemoveActionFromAlarmPayload } from './remove-action-from-alarm'
import { UpdateAlarmLabelPayload } from './update-alarm-label'

@InputType()
export class ZwatchAlarmActionsInput {
  @Field(() => String, { nullable: true })
  alarmUuid: string

  @Field(() => String)
  actionType: string

  @Field(() => String)
  actionUuid: string
}
@InputType()
export class UpdateAlarmPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [ZwatchAlarmActionsInput], { nullable: true })
  actions: ZwatchAlarmActionsInput[]

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => ComparisonOperator, {
    nullable: true,
    description: '阈值比较符'
  })
  comparisonOperator?: ComparisonOperator

  @Field(() => Float, { nullable: true, description: '阈值' })
  threshold?: number

  @Field(() => Float, { nullable: true, description: '冷却时间' })
  repeatInterval?: number

  @Field(() => Float, { nullable: true, description: '持续时间' })
  period?: number

  @Field(() => Float, { nullable: true, description: '报警重复次数' })
  repeatCount?: number

  @Field(() => Boolean, { nullable: true, description: '开启恢复通知' })
  enableRecovery: boolean

  @Field(() => String, { nullable: true, description: '报警等级' })
  emergencyLevel: string

  @Field(() => [UpdateAlarmLabelPayload], { nullable: true })
  labels?: UpdateAlarmLabelPayload[]

  @Field(() => [RemoveActionFromAlarmPayload], { nullable: true })
  removeActionFromAlarmPayload?: RemoveActionFromAlarmPayload[]
}

@InputType()
class UpdateAlarmInput {
  @Field(() => [UpdateAlarmPayload])
  payload: UpdateAlarmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateAlarmService extends ActionService {
  @Inject() updateAlarmAction: UpdateAlarmAction
  @Inject() zqlService: ZQLService
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() updateAlarmLabelAction: UpdateAlarmLabelAction
  @Inject() removeActionFromAlarmAction: RemoveActionFromAlarmAction

  @Mutation(() => ActionResult)
  updateAlarm(@Args('input') input: UpdateAlarmInput) {
    const actionId = input.action.actionId

    const actionFn = async (params: UpdateAlarmPayload, taskId: string) => {
      const { removeActionFromAlarmPayload, ...payload } = params

      const { inventory = {} } = await this.updateAlarmAction.call(payload, {
        actionId,
        taskId
      })
      if (payload?.labels?.length > 0) {
        payload?.labels?.map(async label => {
          const { inventory } = await this.updateAlarmLabelAction.call(label, {
            actionId,
            taskId
          })
        })
      }

      if (payload?.name) {
        let systemTagNameUuid
        try {
          const zqlObject = {
            tableName: 'SystemTag',
            fields: ['uuid', 'tag'],
            condition: {
              resourceUuid: payload?.uuid,
              resourceType: 'AlarmVO',
              tag: {
                [ZOp.like]: 'name::cn::'
              }
            }
          }
          const respTag = await this.zqlService.call(ZQL.stringify(zqlObject))
          systemTagNameUuid = _.get(
            respTag,
            ['results', '0', 'inventories', '0', 'uuid'],
            undefined
          )
        } catch (error) {
          console.log(error)
        }
        if (systemTagNameUuid) {
          await this.updateSystemTagAction.call(
            {
              uuid: systemTagNameUuid,
              tag: `name::cn::${payload?.name}`
            },
            { actionId, taskId }
          )
        }
      }

      if (removeActionFromAlarmPayload?.length > 0) {
        await Promise.all(
          removeActionFromAlarmPayload.map(param =>
            this.removeActionFromAlarmAction.call(param, {
              actionId,
              taskId
            })
          )
        )
      }

      return {
        id: inventory.uuid,
        fields:
          'name, description, comparisonOperator, period, namespace, metricName, threshold, repeatInterval, labels, actions, repeatCount, enableRecovery, emergencyLevel, lastOpDate',
        inventory
      }
    }

    this.actionHelper(input, 'ZWatchAlarmVO', actionFn)
    return { actionId }
  }
}
