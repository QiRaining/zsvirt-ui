import { Injectable, Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'

import FlowConst from '@/common/flow/const'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { RecordActionService } from '@/common/record-action/record-action.service'

import { L3Network } from '../../l3-network.model'
import { CreateL3NetworkTaskService } from './create-task.service'

@Injectable()
export class CreateL3NetworkTaskHandlerService {
  @Inject(CONTEXT) private readonly context
  @Inject() pubSubService: PubSubService
  @Inject() flowInstanceService: FlowInstanceService
  @Inject() private recordActionService: RecordActionService

  protected getSessionId(): string {
    return this.context.req.headers['x-session-id']
  }

  async action(task) {
    // const mainJobId = task.mainJobId
    // 找到主任务
    const mainTaskResult = task.children.find(
      task => task.service === CreateL3NetworkTaskService.name
    ).result

    // const someError = task.children.some(task => !!task.error)

    let payload
    if (task.state === FlowConst.state.FINISHED) {
      await this.recordActionService.recordTaskSuccess(task.config.info.taskId)
      const inventory: L3Network = mainTaskResult.inventory
      payload = {
        sessionId: this.getSessionId(),
        actionId: task.config.info.actionId,
        state: ActionTaskState.success,
        type: 'L3Network',
        id: inventory.uuid,
        inventory: JSON.stringify(inventory)
      }
    } else if (task.state === FlowConst.state.ABORTED) {
      // 主任务失败了，就是 failed 状态
      if (mainTaskResult.error) {
        await this.recordActionService.recordTaskFailed(task.config.info.taskId)
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.fail
        }
      } else {
        // 主任务成功了，但是其他任务失败了，就是 exception 状态
        await this.recordActionService.recordTaskException(task.config.info.taskId)
        const inventory: L3Network = mainTaskResult.inventory
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.exception,
          type: 'L3Network',
          id: inventory.uuid,
          inventory: JSON.stringify(inventory)
        }
      }
    }
    this.pubSubService.response(payload)
  }
}
