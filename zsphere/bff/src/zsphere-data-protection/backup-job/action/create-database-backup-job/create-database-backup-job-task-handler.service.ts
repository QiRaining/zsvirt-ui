import { Injectable, Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'

import FlowConst from '@/common/flow/const'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { RecordActionService } from '@/common/record-action/record-action.service'
import { SchedulerJob } from '@/zsphere-administration/scheduler-job/scheduler-job.model'

@Injectable()
export class CreateDatabaseBackupJobTaskHandlerService {
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
      const schedulerJob: SchedulerJob = task.children[0].result.inventory
      payload = {
        sessionId: this.getSessionId(),
        actionId: task.config.info.actionId,
        state: ActionTaskState.success,
        type: 'SchedulerJob',
        id: schedulerJob.uuid,
        inventory: JSON.stringify(schedulerJob)
      }
    } else if (task.state === FlowConst.state.ABORTED) {
      // 创建定时任务这个主任务失败了，就是 failed 状态
      if (task.children[0].result.error) {
        await this.recordActionService.recordTaskFailed(task.config.info.taskId)
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.fail
        }
      } else {
        // 创建定时任务成功了，但是其他任务失败了，就是 exception 状态
        await this.recordActionService.recordTaskException(task.config.info.taskId)
        const schedulerJob: SchedulerJob = task.children[0].result.inventory
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.exception,
          type: 'SchedulerJob',
          id: schedulerJob.uuid,
          inventory: JSON.stringify(schedulerJob)
        }
      }
    }
    this.pubSubService.response(payload)
  }
}
