import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { AddSchedulerJobsToSchedulerJobGroupAction } from '@/api/zstack/AddSchedulerJobsToSchedulerJobGroupAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeResourceOwnerAction } from '@/api/zstack/ChangeResourceOwnerAction'
import { CreateSchedulerJobAction } from '@/api/zstack/CreateSchedulerJobAction'
import { DeleteSchedulerJobAction } from '@/api/zstack/DeleteSchedulerJobAction'
import { QuerySchedulerJobGroupAction } from '@/api/zstack/QuerySchedulerJobGroupAction'
import { UpdateSchedulerJobAction } from '@/api/zstack/UpdateSchedulerJobAction'
import { UpdateSchedulerJobGroupAction } from '@/api/zstack/UpdateSchedulerJobGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'
import {
  Parameters,
  SchedulerJob
} from '@/zsphere-administration/scheduler-job/scheduler-job.model'

import { SchedulerJobGroup } from '../scheduler-job-group.model'
import { Priority } from './create-resource-backup-job/create-resource-backup-job.service'

@InputType()
class UpdateSchedulerJobGroupPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Parameters, { nullable: true })
  parameters?: Parameters

  @Field(() => [String], { nullable: true })
  targetResourceUuids?: string[]

  @Field(() => [Priority], { nullable: true })
  priorities?: Priority[]
}

@InputType()
class UpdateSchedulerJobGroupInput {
  @Field(() => [UpdateSchedulerJobGroupPayload])
  payload: UpdateSchedulerJobGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSchedulerJobGroupService extends ActionService {
  @Inject() updateSchedulerJobGroupAction: UpdateSchedulerJobGroupAction
  @Inject() zqlService: ZQLService
  @Inject() querySchedulerJobGroupAction: QuerySchedulerJobGroupAction
  @Inject() updateSchedulerJobAction: UpdateSchedulerJobAction
  @Inject() changeResourceOwnerAction: ChangeResourceOwnerAction
  @Inject() deleteSchedulerJobAction: DeleteSchedulerJobAction
  @Inject() createSchedulerJobAction: CreateSchedulerJobAction
  @Inject()
  addSchedulerJobsToSchedulerJobGroupAction: AddSchedulerJobsToSchedulerJobGroupAction

  @Mutation(() => ActionResult)
  updateSchedulerJobGroup(@Args('input') input: UpdateSchedulerJobGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerJobGroup',
      async (payload: UpdateSchedulerJobGroupPayload, taskId: string) => {
        /**
         * 这一段是copy的updateResourceBackupJobStrategy，如果有疑问，可以问魏琪（如果他还在的话）
         */

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

        const { results = [] } = await this.zqlService.call(
          ZQL.multStringify([
            {
              tableName: 'SchedulerJob',
              condition: {
                schedulerJobGroupUuids: {
                  [ZOp.in]: [payload.uuid]
                }
              }
            },
            {
              tableName: 'SchedulerJobGroup',
              condition: {
                uuid: {
                  [ZOp.eq]: payload.uuid
                }
              }
            }
          ])
        )
        const inventories: SchedulerJob[] = results[0]?.inventories ?? []
        const groupInventory: SchedulerJobGroup = results[1]?.inventories?.[0]
        const name = inventories[0]?.name ?? groupInventory?.name
        const jobData = inventories[0]?.jobData ?? groupInventory?.jobData ?? '{}'
        const targetResourceUuids = inventories.map(item => item.targetResourceUuid)
        const newTargetResourceUuids = payload.targetResourceUuids
          ? _.difference(payload.targetResourceUuids, targetResourceUuids)
          : []
        resourceUuidList.push(...newTargetResourceUuids)
        const deletedJobUuids = payload.targetResourceUuids
          ? _.differenceWith(
              inventories,
              payload.targetResourceUuids,
              (item, uuid) => item.targetResourceUuid === uuid
            ).map(item => item.uuid)
          : []
        const updateJobs = _.differenceWith(
          inventories,
          deletedJobUuids,
          (item, uuid) => item.uuid === uuid
        )
        const updateJobUuidMap = _.fromPairs(
          updateJobs.map(item => [item.targetResourceUuid, item.uuid])
        )
        const priorityMap = _.fromPairs(
          payload.priorities?.map(({ rootVolumeUuid, priority }) => [rootVolumeUuid, priority]) ??
            []
        )

        let _jobData: any = {}
        try {
          _jobData = JSON.parse(String(_.cloneDeep(jobData)))
        } catch (e) {
          console.log(e)
        }

        const {
          backupQosStruct,
          retentionPolicy,
          remoteRetentionPolicy,
          backupStorageUuids,
          remoteBackupStorageUuid,
          fullBackupTriggerUuid
        } = _jobData

        const newRemoteBackupStorageUuid = payload.parameters
          ? payload.parameters.remoteBackupStorageUuid
          : remoteBackupStorageUuid

        const newBackupStorageUuids = payload.parameters
          ? payload.parameters.backupStorageUuids
          : backupStorageUuids?.join(',')

        const parameters = {
          ...backupQosStruct,
          ...retentionPolicy,
          fullBackupTriggerUuid,
          backupStorageUuids: newBackupStorageUuids,
          remoteBackupStorageUuid: newRemoteBackupStorageUuid
        }

        if (newRemoteBackupStorageUuid) {
          parameters.remoteRetentionType = remoteRetentionPolicy?.retentionType
          parameters.remoteRetentionValue = remoteRetentionPolicy?.retentionValue
          parameters.remoteFullBackupRetentionValue =
            remoteRetentionPolicy?.fullBackupRetentionValue
        } else {
          parameters.remoteRetentionValue = ''
          parameters.remoteRetentionType = ''
          parameters.remoteFullBackupRetentionValue = ''
        }

        if (deletedJobUuids.length) {
          await Promise.all(
            deletedJobUuids.map(jobUuid =>
              this.deleteSchedulerJobAction.call({ uuid: jobUuid }, { actionId, taskId })
            )
          )
        }
        if (
          typeof payload.name === 'string' ||
          typeof payload.description === 'string' ||
          payload.parameters
        ) {
          await this.updateSchedulerJobGroupAction.call(
            {
              uuid: payload.uuid,
              name: payload.name,
              description: payload.description,
              parameters: payload.parameters && parameters
            },
            { actionId, taskId }
          )
          await Promise.all(
            updateJobs.map(({ uuid }) =>
              this.updateSchedulerJobAction.call(
                {
                  uuid,
                  name: payload.name,
                  parameters: payload.parameters && parameters
                },
                { actionId, taskId }
              )
            )
          )
        }
        if (payload.priorities?.length && updateJobs.length) {
          const priorities = {}
          const schedulerJobUuids = []
          payload.priorities.forEach(({ rootVolumeUuid, priority: value }) => {
            const jobUuid = updateJobUuidMap[rootVolumeUuid]
            if (jobUuid) {
              schedulerJobUuids.push(jobUuid)
              priorities[jobUuid] = value ?? 0
            }
          })
          const param = {
            schedulerJobGroupUuid: payload.uuid,
            schedulerJobUuids,
            priorities
          }
          await this.addSchedulerJobsToSchedulerJobGroupAction.call(param, {
            actionId,
            taskId
          })
        }
        if (newTargetResourceUuids.length) {
          const results = await Promise.all(
            newTargetResourceUuids.map(targetResourceUuid =>
              this.createSchedulerJobAction.call(
                {
                  name: payload.name ?? name,
                  type: 'vmBackup',
                  parameters,
                  targetResourceUuid
                },
                { actionId, taskId }
              )
            )
          )
          const param = {
            schedulerJobGroupUuid: payload.uuid,
            schedulerJobUuids: results.map(({ inventory }) => inventory.uuid),
            priorities: _.fromPairs(
              results.map(({ inventory }) => [
                inventory.uuid,
                priorityMap[inventory.targetResourceUuid] ?? 0
              ])
            )
          }
          await this.addSchedulerJobsToSchedulerJobGroupAction.call(param, {
            actionId,
            taskId
          })
        }

        // 更改所有者。可能没有权限修改，所以加上 try catch。
        try {
          if (resourceUuidList.length > 0 && accountUuid) {
            await Promise.all(
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

        return { id: payload.uuid }
      }
    )
    return { actionId }
  }
}
