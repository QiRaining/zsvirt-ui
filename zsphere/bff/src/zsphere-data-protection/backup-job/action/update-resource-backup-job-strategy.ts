import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'
import * as _ from 'lodash'

import { AddSchedulerJobGroupToSchedulerTriggerAction } from '@/api/zstack/AddSchedulerJobGroupToSchedulerTriggerAction'
import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeResourceOwnerAction } from '@/api/zstack/ChangeResourceOwnerAction'
import {
  CreateSchedulerTriggerAction,
  CreateSchedulerTriggerResult
} from '@/api/zstack/CreateSchedulerTriggerAction'
import { DeleteSchedulerTriggerAction } from '@/api/zstack/DeleteSchedulerTriggerAction'
import { QuerySchedulerJobGroupAction } from '@/api/zstack/QuerySchedulerJobGroupAction'
import { RemoveSchedulerJobGroupFromSchedulerTriggerAction } from '@/api/zstack/RemoveSchedulerJobGroupFromSchedulerTriggerAction'
import { UpdateSchedulerJobAction } from '@/api/zstack/UpdateSchedulerJobAction'
import { UpdateSchedulerJobGroupAction } from '@/api/zstack/UpdateSchedulerJobGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL from '@/common/zql/index'
import { Parameters } from '@/zsphere-administration/scheduler-job/scheduler-job.model'
import { SchedulerType } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.model'

@InputType()
abstract class UpdateSchedulerTrigger {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Float, { nullable: true }) // 周期，类型为simple的时候才有，一般每小时、每分钟类型的定时器用simple类型
  schedulerInterval?: number

  @Field(() => Float, { nullable: true })
  repeatCount?: number

  @Field(() => Float, { nullable: true }) // 开始时间
  startTime?: number

  @Field(() => SchedulerType) // simple/cron
  schedulerType: SchedulerType

  @Field(() => String, { nullable: true })
  cron?: string
}

@InputType()
class UpdateResourceBackupJobStrategyPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Parameters, { nullable: true })
  parameters: Parameters

  @Field(() => [UpdateSchedulerTrigger], { defaultValue: [] })
  incrementalTriggers: UpdateSchedulerTrigger[]

  @Field(() => UpdateSchedulerTrigger, { nullable: true })
  fullTrigger?: UpdateSchedulerTrigger
}

@InputType()
class UpdateResourceBackupJobStrategyInput {
  @Field(() => [UpdateResourceBackupJobStrategyPayload])
  payload: UpdateResourceBackupJobStrategyPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateResourceBackupJobStrategyService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() querySchedulerJobGroupAction: QuerySchedulerJobGroupAction
  @Inject() deleteSchedulerTriggerAction: DeleteSchedulerTriggerAction
  @Inject() createSchedulerTriggerAction: CreateSchedulerTriggerAction
  @Inject() updateSchedulerJobGroupAction: UpdateSchedulerJobGroupAction
  @Inject() updateSchedulerJobAction: UpdateSchedulerJobAction
  @Inject() changeResourceOwnerAction: ChangeResourceOwnerAction
  @Inject()
  addSchedulerJobGroupToSchedulerTriggerAction: AddSchedulerJobGroupToSchedulerTriggerAction
  @Inject()
  removeSchedulerJobGroupFromSchedulerTriggerAction: RemoveSchedulerJobGroupFromSchedulerTriggerAction

  @Mutation(() => ActionResult)
  updateResourceBackupJobStrategy(@Args('input') input: UpdateResourceBackupJobStrategyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerJobGroup',
      async (payload: UpdateResourceBackupJobStrategyPayload, taskId: string) => {
        // 获取所有者, 修改策略都是采用的创建，会有所有者的问题。admin的修改操作可能导致项目用户无法使用。
        let accountUuid: string | undefined = undefined // 记录资源所有者
        const resourceUuidList: string[] = [] // 收集新建资源
        const zqlObject = {
          tableName: 'AccountResourceRef',
          field: 'accountUuid',
          condition: {
            resourceUuid: payload.uuid
          }
        }
        const zql = ZQL.stringify(zqlObject)

        // 可能没有权限查询，所以加上 try catch。
        try {
          const respAccount = await this.zqlService.call(zql)
          accountUuid = _.get(
            respAccount,
            ['results', '0', 'inventories', '0', 'accountUuid'],
            undefined
          )
        } catch (error) {
          console.log(error)
        }

        const resp = await this.querySchedulerJobGroupAction.call({
          conditions: [
            {
              key: 'uuid',
              op: Op.eq,
              value: payload.uuid
            }
          ]
        })

        const {
          name,
          jobData,
          triggersUuid = [],
          jobsUuid = []
        } = _.get(resp, ['inventories', '0'], {})
        let _jobData: any = {}
        try {
          _jobData = JSON.parse(String(_.cloneDeep(jobData)))
        } catch (e) {
          console.log(e)
        }

        const {
          backupStorageUuids,
          remoteBackupStorageUuid,
          fullBackupTriggerUuid: oldFullId
        } = _jobData

        const parameters: any = {
          ...payload.parameters,
          backupStorageUuids: backupStorageUuids?.join(','),
          remoteBackupStorageUuid
        }

        const oldTriggers = _.compact(_.uniq(triggersUuid.concat(oldFullId))) as string[]

        let newFullId = ''
        if (payload.fullTrigger) {
          // 创建新的fullTrigger
          const triggerResult: CreateSchedulerTriggerResult =
            await this.createSchedulerTriggerAction.call(
              { name, ...payload.fullTrigger },
              { actionId, taskId }
            )
          newFullId = triggerResult.inventory.uuid
          resourceUuidList.push(triggerResult.inventory.uuid)
          // 将新的Trigger加入JobGroup
          await this.addSchedulerJobGroupToSchedulerTriggerAction.call(
            {
              schedulerJobGroupUuid: payload.uuid,
              schedulerTriggerUuid: triggerResult.inventory.uuid
            },
            { actionId, taskId }
          )
        }

        // 将旧的Trigger从JobGroup移除
        await Promise.all(
          _.map(oldTriggers, triggerUuid =>
            this.removeSchedulerJobGroupFromSchedulerTriggerAction.call(
              {
                schedulerJobGroupUuid: payload.uuid,
                schedulerTriggerUuid: triggerUuid
              },
              { actionId, taskId }
            )
          )
        ).then(async () => {
          await Promise.all(
            _.map(oldTriggers, triggerUuid =>
              this.deleteSchedulerTriggerAction.call({ uuid: triggerUuid }, { actionId, taskId })
            )
          )
        })

        // 创建新的Trigger并加入JobGroup
        await Promise.all(
          _.map(payload.incrementalTriggers, trigger =>
            this.createSchedulerTriggerAction
              .call({ name, ...trigger }, { actionId, taskId })
              .then(result => {
                resourceUuidList.push(result.inventory.uuid)
                return this.addSchedulerJobGroupToSchedulerTriggerAction.call(
                  {
                    schedulerJobGroupUuid: payload.uuid,
                    schedulerTriggerUuid: result.inventory.uuid
                  },
                  { actionId, taskId }
                )
              })
          )
        )

        parameters.fullBackupTriggerUuid = newFullId ?? ''

        await this.updateSchedulerJobGroupAction.call(
          { uuid: payload.uuid, parameters },
          { actionId, taskId }
        )
        await Promise.all(
          _.map(jobsUuid, jobUuid =>
            this.updateSchedulerJobAction.call({ uuid: jobUuid, parameters }, { actionId, taskId })
          )
        )

        // 更改所有者。可能没有权限修改，所以加上 try catch。
        try {
          if (resourceUuidList.length > 0 && accountUuid) {
            await Promise.race(
              _.map(resourceUuidList, resourceUuid =>
                this.changeResourceOwnerAction.call({
                  resourceUuid: resourceUuid,
                  accountUuid: accountUuid
                })
              )
            )
          }
        } catch (error) {
          console.log(error)
        }

        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
