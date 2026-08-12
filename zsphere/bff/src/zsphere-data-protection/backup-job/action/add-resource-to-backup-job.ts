import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { get as _get, map as _map, keys as _keys, cloneDeep as _cloneDeep } from 'lodash'

import { AddSchedulerJobsToSchedulerJobGroupAction } from '@/api/zstack/AddSchedulerJobsToSchedulerJobGroupAction'
import { Op } from '@/api/zstack/base/query-base'
import { CreateSchedulerJobAction } from '@/api/zstack/CreateSchedulerJobAction'
import { QuerySchedulerJobGroupAction } from '@/api/zstack/QuerySchedulerJobGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { Priority } from './create-resource-backup-job/create-resource-backup-job.service'

@InputType()
class AddResourceToBackupJobPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  resourceUuids: string[]

  @Field(() => [Priority], { nullable: true, defaultValue: [] })
  priorities?: Priority[]
}

@InputType()
class AddResourceToBackupJobInput {
  @Field(() => [AddResourceToBackupJobPayload])
  payload: AddResourceToBackupJobPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddResourceToBackupJobService extends ActionService {
  @Inject() querySchedulerJobGroupAction: QuerySchedulerJobGroupAction
  @Inject()
  addSchedulerJobsToSchedulerJobGroupAction: AddSchedulerJobsToSchedulerJobGroupAction
  @Inject() createSchedulerJobAction: CreateSchedulerJobAction

  @Mutation(() => ActionResult)
  addResourceToBackupJob(@Args('input') input: AddResourceToBackupJobInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerJobGroup',
      async (payload: AddResourceToBackupJobPayload, taskId: string) => {
        const resp = await this.querySchedulerJobGroupAction.call({
          conditions: [
            {
              key: 'uuid',
              op: Op.eq,
              value: payload.uuid
            }
          ]
        })

        const { name, jobData, jobType } = _get(resp, ['inventories', '0'], {})

        let _jobData: any = {}
        try {
          _jobData = JSON.parse(String(_cloneDeep(jobData)))
        } catch (e) {
          console.log(e)
        }

        const { backupQosStruct, retentionPolicy, backupStorageUuids, remoteRetentionPolicy } =
          _jobData
        delete _jobData.backupQosStruct
        delete _jobData.retentionPolicy
        delete _jobData.backupStorageUuids
        _keys(backupQosStruct).forEach(key => {
          _jobData[key] = String(backupQosStruct[key])
        })
        _jobData.backupStorageUuids = backupStorageUuids.join(',')
        _jobData.retentionValue = String(retentionPolicy.retentionValue)
        _jobData.retentionType = retentionPolicy.retentionType
        if (retentionPolicy.fullBackupRetentionValue) {
          _jobData.fullBackupRetentionValue = String(retentionPolicy.fullBackupRetentionValue)
        }
        if (remoteRetentionPolicy) {
          delete _jobData.remoteRetentionPolicy

          _jobData.remoteRetentionValue = String(remoteRetentionPolicy?.retentionValue)
          _jobData.remoteRetentionType = remoteRetentionPolicy?.retentionType
          if (remoteRetentionPolicy.fullBackupRetentionValue) {
            _jobData.remoteFullBackupRetentionValue = String(
              remoteRetentionPolicy.fullBackupRetentionValue
            )
          }
        }
        const parameters = _jobData
        const jobUuids = []
        const jobUuidMap = {}
        const tasks = _map(payload?.resourceUuids, resourceUuid => {
          const jobParam = {
            targetResourceUuid: resourceUuid,
            name,
            type: jobType,
            parameters
          }
          return this.createSchedulerJobAction
            .call(jobParam, { actionId, taskId })
            .then(async resp => {
              if (resp?.inventory?.uuid) {
                jobUuids.push(resp?.inventory?.uuid)
                jobUuidMap[resourceUuid] = resp.inventory.uuid
              }
            })
        })

        await Promise.allSettled(tasks)

        if (jobUuids?.length > 0) {
          const priorities = {}
          payload.priorities?.forEach(({ rootVolumeUuid, priority }) => {
            const jobUuid = jobUuidMap[rootVolumeUuid]
            if (jobUuid) {
              priorities[jobUuid] = priority ?? 0
            }
          })
          const param = {
            schedulerJobGroupUuid: payload.uuid,
            schedulerJobUuids: jobUuids,
            priorities
          }
          await this.addSchedulerJobsToSchedulerJobGroupAction.call(param, {
            actionId,
            taskId
          })
        }
        if (jobUuids?.length !== payload?.resourceUuids?.length) {
          throw new Error('')
        }

        return {
          id: payload.uuid
        }
      },
      {
        listenerType: 'BindSchedulerJobGroup'
      }
    )

    return { actionId }
  }
}
