type UUID = string & { length: 32 }

export type ActionId = UUID

export type TaskId = UUID

export type ApiId = string

// 每个Action自己独立的上下文
export interface ActionContext {
  tasks: {
    [taskId: string]: {
      apis: {
        [apiId: string]: {
          data?: any
          error?: any
        }
      }
      lastApiData?: any
      data?: any
      error?: any
    }
  }
  error?: any
  // 自定义一些额外的数据，操作
  meta?: any
}

export type ApiExecute<T> = (
  taskId: TaskId,
  apiId: ApiId,
  payload: T,
  context: ActionContext
) => Promise<any>

export interface Api<T> {
  execute: ApiExecute<T>
  action?: string
  name: string
  estimatedTime: number
}

export type TaskExecute = (taskId: string, context: ActionContext) => Promise<any>

export interface Task<T> {
  execute: TaskExecute
  name?: string
  id: TaskId
  apis: Api<T>[]
  payload: T
}

export interface Action<T> {
  name?: string
  id: ActionId
  param: any
  tasks: Task<T>[]
  headers: {
    [key: string]: string
  }
  resourceType: string
}

export interface ActionExecution<T> extends Action<T> {
  action: Action<T>
  context: ActionContext
  isExecuting: boolean
  isPaused: boolean
  progress: number
  totalEstimatedTime: number
  currentTaskIndex: number
  currentApiIndex: number
  currentTaskId: string
  currentApiId: string
}
