import { Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'

import { NormalActionHelperService } from '@/common/action-subscription/normal-action-helper.service'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'
import { FlowManagerService } from '@/common/flow/flow-manager/flow-manager.service'
import { Logger } from '@/common/logger/logger.decorator'
import type { ZSLoggerService } from '@/common/logger/logger.service'
import type { AbstractActionInput, ActionTaskResult } from '@/common/model/action.model'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { RecordActionService } from '@/common/record-action/record-action.service'
import { genUuid } from '@/utils'

export class ZopsActionService {
  @Inject(CONTEXT) private readonly context
  @Inject() flowManagerService: FlowManagerService
  @Inject() flowInstanceService: FlowInstanceService
  @Inject() normalActionResponseService: NormalActionHelperService
  @Inject() pubSubService: PubSubService
  @Inject() recordActionService: RecordActionService
  @Logger(ZopsActionService.name) private logger: ZSLoggerService

  protected getSessionId(): string {
    return this.context.req.headers['x-session-id']
  }

  protected async actionHelper(
    input: AbstractActionInput,
    resourceType: string,
    fn: IActionHelperCallback,
    record = true
  ) {
    const { payload, action } = input
    const { actionId, name: actionName } = action

    const taskId = genUuid()
    if (record) {
      await this.recordActionService.recordActionStart(payload, actionId, actionName)
      await this.recordActionService.recordTaskStart(taskId, actionId)
    }

    let taskResult: ActionTaskResult
    try {
      const rt: IActionHelperCallbackResult = await fn(payload, taskId)
      if (record) {
        await this.recordActionService.recordActionSuccess(actionId)
        await this.recordActionService.recordTaskSuccess(taskId)
      }
      taskResult = {
        sessionId: this.getSessionId(),
        actionId: actionId,
        state: ActionTaskState.success,
        type: resourceType,
        id: rt.id
      }
    } catch (error) {
      if (record) {
        await this.recordActionService.recordActionFailed(actionId)
        await this.recordActionService.recordTaskFailed(taskId)
      }
      taskResult = {
        state: ActionTaskState.fail,
        sessionId: this.getSessionId(),
        actionId: actionId,
        error: JSON.stringify(error),
        id: payload?.uuid
      }
      this.logger.error(error)
    } finally {
      this.pubSubService.response(taskResult)
      return
    }
  }
}

export interface IActionHelperCallbackResult {
  id: string
}

export interface IActionHelperCallback {
  //定义函数的参数类型和返回值类型
  (payload: any, taskId: string): Promise<IActionHelperCallbackResult>
}
