import { Injectable, Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'

import FlowConst from '@/common/flow/const'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { RecordActionService } from '@/common/record-action/record-action.service'

import { SchedulerJobGroup } from '../../scheduler-job-group.model'

@Injectable()
export class CreateResourceBackupJobTaskHandlerService {
  @Inject(CONTEXT) private readonly context
  @Inject() pubSubService: PubSubService
  @Inject() flowInstanceService: FlowInstanceService
  @Inject() private recordActionService: RecordActionService

  protected getSessionId(): string {
    return this.context.req.headers['x-session-id']
  }

  async action(task) {
    let payload
    if (task.state === FlowConst.state.FINISHED) {
      await this.recordActionService.recordTaskSuccess(task.config.info.taskId)
      const schedulerJobGroup: SchedulerJobGroup = task.children[0].result.inventory
      payload = {
        sessionId: this.getSessionId(),
        actionId: task.config.info.actionId,
        state: ActionTaskState.success,
        type: 'SchedulerJobGroup',
        id: schedulerJobGroup.uuid,
        inventory: JSON.stringify(schedulerJobGroup)
      }
    } else if (task.state === FlowConst.state.ABORTED) {
      // 创建定时任务组这个主任务失败了，就是 failed 状态
      if (task.children[0].result.error) {
        await this.recordActionService.recordTaskFailed(task.config.info.taskId)
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.fail
        }
      } else {
        // 创建定时任务组成功了，但是其他任务失败了，就是 exception 状态
        await this.recordActionService.recordTaskException(task.config.info.taskId)
        const schedulerJobGroup: SchedulerJobGroup = task.children[0].result.inventory
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.exception,
          type: 'SchedulerJobGroup',
          id: schedulerJobGroup.uuid,
          inventory: JSON.stringify(schedulerJobGroup)
        }
      }
    }
    this.pubSubService.response({
      ...payload,
      listenerType: 'CreateSchedulerJobGroup'
    })
  }
}
