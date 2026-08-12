import { ActionManagerService } from '@/base/action-manager'
import { Action, ActionId, ApiExecute, Task, TaskExecute, TaskId } from '@/base/action-type'
import { ActionInput } from '@/common/model/action.model'
import { genUuid } from '@/utils'

export class ActionBuilder<T> {
  private tasks: Task<T>[] = []
  private execute: (context: any, manager: ActionManagerService) => Promise<any>
  private currentTask: Task<T> | null = null

  constructor(
    private input: {
      action: ActionInput
      payload: T
    },
    private resourceType: string,
    private headers: { [key: string]: string }
  ) {}

  public addTask(id: TaskId, payload: any, execute: TaskExecute): ActionBuilder<T> {
    this.currentTask = {
      id,
      apis: [],
      payload,
      execute
    }
    this.tasks.push(this.currentTask)
    return this
  }

  public addApi(name: string, execute: ApiExecute<T>, estimatedTime = 1): ActionBuilder<T> {
    if (!this.currentTask) {
      throw new Error('You must add a task before adding an API')
    }
    this.currentTask.apis.push({ name, execute, estimatedTime })
    return this
  }

  public setExecute(
    execute: (context: any, manager: ActionManagerService) => Promise<any>
  ): ActionBuilder<T> {
    this.execute = execute
    return this
  }

  public addBatchTasks(
    execute: TaskExecute,
    apiConfigs: Array<{
      name: string
      execute: ApiExecute<T>
      estimatedTime?: number
    }>
  ): ActionBuilder<T> {
    const items = Array.isArray(this.input.payload) ? this.input.payload : [this.input.payload]

    items.forEach((item, index) => {
      const taskId = genUuid() as TaskId
      this.addTask(taskId, item, execute)

      apiConfigs.forEach(config => {
        this.addApi(config.name, config.execute, config.estimatedTime)
      })
    })

    return this
  }

  public build(): Action<T> {
    const action: Action<T> = {
      id: this.input.action.actionId as ActionId,
      name: this.input.action.name,
      tasks: this.tasks,
      param: this.input.payload,
      headers: this.headers,
      resourceType: this.resourceType
    }
    return action
  }
}
