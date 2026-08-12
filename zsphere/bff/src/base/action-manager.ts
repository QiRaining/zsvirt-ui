import { EventEmitter } from 'events'

import { Injectable, Inject, Global } from '@nestjs/common'
import * as _ from 'lodash'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { Action, ActionExecution, Task } from '@/base/action-type'
import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { RecordActionService } from '@/common/record-action/record-action.service'
import { genUuid } from '@/utils'

const globalActions: Map<string, ActionExecution<any>> = new Map()
const eventEmitter = new EventEmitter()

@Global()
@Injectable()
export class ActionManagerService {
  private instance: ActionManagerService
  // private actions: Map<string, ActionExecution> = new Map()
  // private eventEmitter: EventEmitter = new EventEmitter()
  @Inject(RecordActionService)
  private recordActionService: RecordActionService
  @Inject() pubSubService: PubSubService
  @Inject() apiBase: ZStackApiBase
  @Logger(ActionManagerService.name) private logger: ZSLoggerService

  private get actions(): Map<string, ActionExecution<any>> {
    return globalActions
  }

  private get eventEmitter(): EventEmitter {
    return eventEmitter
  }

  constructor() {
    if (!this.instance) {
      this.instance = this
    }
    return this.instance
  }

  public getEventEmitter() {
    return this.eventEmitter
  }

  public registerAction<T>(actionId: string, action: Action<T>): ActionManagerService {
    const totalEstimatedTime = action.tasks.reduce(
      (sum, task) =>
        sum + task.apis.reduce((taskSum, api) => taskSum + (api.estimatedTime || 1), 0),
      0
    )

    this.actions.set(actionId, {
      ...action,
      action,
      context: {
        tasks: {}
      },
      isExecuting: false,
      isPaused: false,
      progress: 0,
      totalEstimatedTime,
      currentTaskIndex: 0,
      currentApiIndex: 0,
      currentTaskId: '',
      currentApiId: ''
    })
    return this
  }

  public async executeAction(actionId: string, parentContext?: any): Promise<any> {
    const actionExecution = this.actions.get(actionId)
    if (!actionExecution) {
      throw new Error(`Action with id ${actionId} not found`)
    }

    if (actionExecution.isExecuting && !actionExecution.isPaused) {
      this.logger.log(`Action ${actionId} is already being executed`)
      return
    }

    if (!actionExecution.isPaused) {
      actionExecution.isExecuting = true
      actionExecution.context = parentContext ? { ...parentContext } : {}
      actionExecution.progress = 0
      actionExecution.currentTaskIndex = 0
      actionExecution.currentApiIndex = 0
      await this.recordActionService.recordActionStart(
        actionExecution.param,
        actionId,
        actionExecution.name,
        { req: { headers: actionExecution.headers } }
      )
    } else {
      actionExecution.isPaused = false
      await this.recordActionService.recordActionResume(actionId)
    }

    const { action } = actionExecution
    this.logger.log(`Executing action: ${action.name} (ID: ${actionId})`)
    try {
      await this.executeActionInternal(actionExecution, actionId)
      actionExecution.isExecuting = false
      await this.recordActionService.recordActionSuccess(actionId)
    } catch (error) {
      console.error(`Error executing action ${action.name} (ID: ${actionId}):`, error)
      _.set(actionExecution.context, 'error', error)
      actionExecution.isExecuting = false
      await this.recordActionService.recordActionFailed(actionId)
      // throw error
    }
  }

  private async executeActionInternal<T>(
    actionExecution: ActionExecution<T>,
    actionId: string
  ): Promise<any> {
    const { action, context } = actionExecution
    for (let i = actionExecution.currentTaskIndex; i < action.tasks.length; i++) {
      if (actionExecution.isPaused) {
        actionExecution.currentTaskIndex = i
        return
      }
      const task = action.tasks[i]
      this.logger.log(`Executing task: ${task.id}`)
      const taskId = task.id
      actionExecution.currentTaskId = taskId
      await this.recordActionService.recordTaskStart(taskId, actionId)
      try {
        _.set(context, `tasks.${task.id}`, {})
        await this.executeTask(task, context, actionId, actionExecution)
        await this.recordActionService.recordTaskSuccess(taskId)
      } catch (error) {
        console.error(`Error executing task ${task.id}:`, error)
        _.set(context, `tasks.${taskId}.error`, error)
        await this.recordActionService.recordTaskFailed(taskId)
        throw error
      }
    }
    // return await action.execute(context, this)
  }

  private async executeTask<T>(
    task: Task<T>,
    context: any,
    actionId: string,
    actionExecution: ActionExecution<T>
  ): Promise<void> {
    try {
      for (let i = actionExecution.currentApiIndex; i < task.apis.length; i++) {
        if (actionExecution.isPaused) {
          actionExecution.currentApiIndex = i
          return
        }
        const api = task.apis[i]
        this.logger.log(`Executing API: ${api.name}`)
        const apiId = genUuid()
        actionExecution.currentApiId = apiId
        try {
          const result = await api.execute(task.id, apiId, task.payload, context)
          _.set(context, `tasks.${task.id}.lastApiData`, result)
          if (result !== undefined) {
            _.set(context, `tasks.${task.id}.apis.${apiId}.data`, result)
          }
          await this.updateProgress(actionId, api.estimatedTime || 1)
          // await this.apiBase.recordSuccess({}, { apiId })

          // await this.recordActionService.recordApiSuccess(apiId)
        } catch (error) {
          console.error(`Error executing API ${api.name}:`, error)
          _.set(context, `tasks.${task.id}.apis.${apiId}.error`, error)

          this.pubSubService.response({
            state: ActionTaskState.fail,
            sessionId: actionExecution.action.headers['x-session-id'],
            actionId: actionId,
            type: actionExecution.resourceType,
            // listenerType: listenerType,
            error: JSON.stringify(error),
            id: apiId
          })
          throw error
        }
      }
      const result = await task.execute(task.id, context)
      this.pubSubService.response({
        sessionId: actionExecution.action.headers['x-session-id'],
        actionId: actionId,
        state: ActionTaskState.success,
        inventory: JSON.stringify({}),
        id: actionId,
        type: actionExecution.resourceType
        // id: rt.id,
        // fields: rt.fields,
        // listenerType: listenerType,
        // inventory: JSON.stringify(rt.inventory)
      })
      if (result !== undefined) {
        _.set(context, `tasks.${task.id}.data`, result)
      }
    } catch (error) {
      this.pubSubService.response({
        sessionId: actionExecution.action.headers['x-session-id'],
        actionId: actionId,
        state: ActionTaskState.fail,
        inventory: JSON.stringify({}),
        id: actionId,
        type: actionExecution.resourceType
        // id: rt.id,
        // fields: rt.fields,
        // listenerType: listenerType,
        // inventory: JSON.stringify(rt.inventory)
      })

      // await this.recordActionService.recordApiFailed(apiId)
      // await this.apiBase.recordFailed(error, { apiId })
      throw error
    }
    actionExecution.currentApiIndex = 0
  }

  private async updateProgress(actionId: string, completedTime: number) {
    const actionExecution = this.actions.get(actionId)
    if (actionExecution) {
      actionExecution.progress += completedTime
      const progressPercentage = Math.min(
        100,
        Math.round((actionExecution.progress / actionExecution.totalEstimatedTime) * 100)
      )
      await this.recordActionService.recordActionProgress(actionId, progressPercentage)
      this.pubSubService.response({
        sessionId: actionExecution.action.headers['x-session-id'],
        actionId: actionId,
        state: ActionTaskState.running,
        inventory: JSON.stringify({}),
        id: actionId,
        type: actionExecution.resourceType,
        progress: progressPercentage
        // id: rt.id,
        // fields: rt.fields,
        // listenerType: listenerType,
        // inventory: JSON.stringify(rt.inventory)
      })
      this.eventEmitter.emit('progress', {
        actionId,
        progress: progressPercentage
      })
    }
  }

  public onProgress(callback: (data: { actionId: string; progress: number }) => void) {
    this.eventEmitter.on('progress', callback)
  }

  public async pauseAction(actionId: string): Promise<void> {
    const actionExecution = this.actions.get(actionId)
    if (actionExecution && actionExecution.isExecuting && !actionExecution.isPaused) {
      actionExecution.isPaused = true
      await this.recordActionService.recordActionSuspended(actionId)
      if (actionExecution.currentTaskId) {
        await this.recordActionService.recordTaskSuspended(actionExecution.currentTaskId)
      }
      if (actionExecution.currentApiId) {
        await this.recordActionService.recordApiSuspended(actionExecution.currentApiId)
      }
      this.eventEmitter.emit('paused', { actionId })
      this.logger.log(`Action ${actionId} paused`)
    }
  }

  public async resumeAction(actionId: string): Promise<void> {
    const actionExecution = this.actions.get(actionId)
    if (actionExecution && actionExecution.isPaused) {
      await this.recordActionService.recordActionResume(actionId)
      if (actionExecution.currentTaskId) {
        await this.recordActionService.recordTaskResume(actionExecution.currentTaskId)
      }
      if (actionExecution.currentApiId) {
        await this.recordActionService.recordApiResume(actionExecution.currentApiId)
      }
      this.executeAction(actionId)
      this.eventEmitter.emit('resumed', { actionId })
      this.logger.log(`Action ${actionId} resumed`)
    }
  }

  public onPaused(callback: (data: { actionId: string }) => void) {
    this.eventEmitter.on('paused', callback)
  }

  public onResumed(callback: (data: { actionId: string }) => void) {
    this.eventEmitter.on('resumed', callback)
  }

  public clearAction(actionId: string): ActionManagerService {
    this.actions.delete(actionId)
    return this
  }

  public getAction(actionId: string): any {
    const actionExecution = this.actions.get(actionId)
    if (!actionExecution) {
      throw new Error(`Action with id ${actionId} not found`)
    }
    return actionExecution
  }

  public getActionContext(actionId: string): any {
    return this.getContext(actionId)
  }

  public getContext(actionId: string): any {
    const actionExecution = this.actions.get(actionId)
    if (!actionExecution) {
      throw new Error(`Action with id ${actionId} not found`)
    }
    return actionExecution.context
  }

  public updateActionContext(actionId: string, updater: (context: any) => void): void {
    const actionExecution = this.actions.get(actionId)
    if (!actionExecution) {
      throw new Error(`Action with id ${actionId} not found`)
    }
    updater(actionExecution.context)
  }
}
