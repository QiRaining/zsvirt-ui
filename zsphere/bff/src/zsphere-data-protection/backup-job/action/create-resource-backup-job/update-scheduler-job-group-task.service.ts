import { Injectable, Inject } from '@nestjs/common'
import { cloneDeep as _cloneDeep, keys as _keys } from 'lodash'

import {
  UpdateSchedulerJobGroupAction,
  UpdateSchedulerJobGroupActionParam
} from '@/api/zstack/UpdateSchedulerJobGroupAction'
import { FlowTaskBase } from '@/base/flow-task-base'

@Injectable()
export class UpdateSchedulerJobGroupTaskService extends FlowTaskBase {
  @Inject()
  private updateSchedulerJobGroupAction: UpdateSchedulerJobGroupAction

  async action(task) {
    const apiId = task.taskId

    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)
    let parentTask = await this.flowInstanceService.getParentFromRoot(task.taskId, rootTask)

    const prevTask = await this.flowInstanceService.getPrevFromRoot(parentTask.taskId, rootTask)

    const fullTriggerTask = await this.flowInstanceService.getPrevFromRoot(
      prevTask.taskId,
      rootTask
    )

    parentTask = await this.flowInstanceService.getParentFromRoot(parentTask.taskId, rootTask)

    parentTask = await this.flowInstanceService.getParentFromRoot(parentTask.taskId, rootTask)

    const groupTask = await this.flowInstanceService.getPrevFromRoot(parentTask.taskId, rootTask)

    let _jobData: any = {}
    try {
      _jobData = JSON.parse(String(_cloneDeep(groupTask.result.inventory.jobData)))
    } catch (e) {
      console.log(e)
    }

    const { remoteRetentionPolicy } = _jobData

    const backupQosStruct = _cloneDeep(_jobData.backupQosStruct)
    const retentionPolicy = _cloneDeep(_jobData.retentionPolicy)
    delete _jobData.backupQosStruct
    delete _jobData.retentionPolicy
    if (remoteRetentionPolicy) {
      delete _jobData.remoteRetentionPolicy

      _jobData.remoteRetentionValue = String(remoteRetentionPolicy?.retentionValue)
      _jobData.remoteRetentionType = remoteRetentionPolicy?.retentionType
    }
    _keys(backupQosStruct).forEach(key => {
      _jobData[key] = String(backupQosStruct[key])
    })

    const param: UpdateSchedulerJobGroupActionParam = {
      name: groupTask.result.inventory.name,
      uuid: groupTask.result.inventory.uuid,
      parameters: {
        ..._jobData,
        retentionValue: String(retentionPolicy?.retentionValue),
        retentionType: retentionPolicy?.retentionType,
        backupStorageUuids: _jobData?.backupStorageUuids?.join(','),
        fullBackupTriggerUuid: fullTriggerTask.result.inventory.uuid
      }
    }

    return await this.updateSchedulerJobGroupAction.call(param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
  }
}
