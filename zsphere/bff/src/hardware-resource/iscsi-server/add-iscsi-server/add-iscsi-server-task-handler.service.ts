import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import * as _ from 'lodash'

import FlowConst from '@/common/flow/const'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { RecordActionService } from '@/common/record-action/record-action.service'

import { IscsiServer } from '../iscsi-server.model'

@Injectable()
export class AddIscsiServerTaskHandlerService {
  @Inject(CONTEXT) private readonly context
  @Inject() pubSubService: PubSubService
  @Inject() flowInstanceService: FlowInstanceService
  @Inject() private recordActionService: RecordActionService

  protected getSessionId(): string {
    return this.context.req.headers['x-session-id']
  }

  async action(task) {
    const mainJobId = task.mainJobId
    let payload
    if (task.state === FlowConst.state.FINISHED) {
      await this.recordActionService.recordTaskSuccess(task.config.info.taskId)
      const iscsiServer: IscsiServer = task.children[0].result.inventory
      payload = {
        sessionId: this.getSessionId(),
        actionId: task.config.info.actionId,
        state: ActionTaskState.success,
        type: 'IscsiServer',
        id: iscsiServer.uuid,
        inventory: JSON.stringify(iscsiServer)
      }
    } else if (task.state === FlowConst.state.ABORTED) {
      // 这个主任务失败了，就是 failed 状态
      if (task.children[0].result.error) {
        await this.recordActionService.recordTaskFailed(task.config.info.taskId)
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.fail
        }
      } else {
        // 创建成功了，但是其他任务失败了，就是 exception 状态
        await this.recordActionService.recordTaskException(task.config.info.taskId)
        const iscsiServer: IscsiServer = task.children[0].result.inventory
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.exception,
          type: 'IscsiServer',
          id: iscsiServer.uuid,
          inventory: JSON.stringify(iscsiServer)
        }
      }
    }
    this.pubSubService.response(payload)
  }
}
