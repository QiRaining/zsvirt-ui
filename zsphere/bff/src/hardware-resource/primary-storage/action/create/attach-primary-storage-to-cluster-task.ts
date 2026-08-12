import { Injectable, Inject } from '@nestjs/common'
import { get } from 'lodash'

import {
  AttachPrimaryStorageToClusterAction,
  AttachPrimaryStorageToClusterActionParam
} from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { FlowTaskBase } from '@/base/flow-task-base'

import { PrimaryStorage as IPrimaryStorage } from '../../primary-storage.model'

@Injectable()
export class AttachPrimaryStorageToClusterTaskService extends FlowTaskBase {
  @Inject()
  private attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction

  async action(task) {
    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)
    const prevTask = await this.flowInstanceService.getPrevFromRoot(task.taskId, rootTask)

    const apiId = task.taskId
    const primaryStorageUuid = get(prevTask, 'result.inventory.uuid', '')
    const param: AttachPrimaryStorageToClusterActionParam = {
      clusterUuid: task?.input?.param?.clusterUuid,
      primaryStorageUuid
    }

    try {
      return this.attachPrimaryStorageToClusterAction.call(param, {
        actionId: task.input.info.actionId,
        taskId: task.input.info.taskId,
        apiId
      })
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

export interface CreateIPsecTaskParam extends AttachPrimaryStorageToClusterActionParam {}
