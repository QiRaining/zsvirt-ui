import { Injectable, Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import * as _ from 'lodash'

import FlowConst from '@/common/flow/const'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { RecordActionService } from '@/common/record-action/record-action.service'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

@Injectable()
export class DeleteVmInstanceTaskHandlerService {
  @Inject(CONTEXT) private readonly context
  @Inject() pubSubService: PubSubService
  @Inject() flowInstanceService: FlowInstanceService
  @Inject() private recordActionService: RecordActionService

  protected getSessionId(): string {
    return this.context.req.headers['x-session-id']
  }

  async action(task) {
    let payload
    const extraResultForZSV = { actionType: 'delete' }
    if (task.state === FlowConst.state.FINISHED) {
      await this.recordActionService.recordTaskSuccess(task.config.info.taskId)
      const vm: VmInstance = task.children[0].input.param
      //这里修改一下 ，为了zsv的树状态，添加一个actionType：delete

      payload = {
        sessionId: this.getSessionId(),
        actionId: task.config.info.actionId,
        state: ActionTaskState.success,
        type: 'VmInstance',
        id: vm.uuid,
        inventory: JSON.stringify({ ...vm, ...extraResultForZSV })
      }
    } else if (task.state === FlowConst.state.ABORTED || task.state === FlowConst.state.STOPPED) {
      // 删除云主机这个主任务失败了或者发生error，就是 failed 状态
      if (task.children[0].result.error) {
        await this.recordActionService.recordTaskFailed(task.config.info.taskId)
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.fail
        }
      } else {
        // 删除云主机成功了，但是其他任务失败了，就是 exception 状态
        await this.recordActionService.recordTaskException(task.config.info.taskId)
        const vm: VmInstance = task.children[0].input.param
        payload = {
          sessionId: this.getSessionId(),
          actionId: task.config.info.actionId,
          state: ActionTaskState.exception,
          type: 'VmInstance',
          id: vm.uuid,
          inventory: JSON.stringify({ ...vm, ...extraResultForZSV })
        }
      }
    }
    this.pubSubService.response(payload)
  }
}
