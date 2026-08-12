export const enum FlowTaskState {
  READY = 'READY',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  ABORTED = 'ABORTED',
  CANCELED = 'CANCELED',
  ROLLINGBACK = 'ROLLINGBACK',
  ROLLEDBACK = 'ROLLEDBACK'
}

export interface FlowTask {
  taskId: string
  service: string
  state: FlowTaskState
  config?: FlowTaskConfig
  mainJobId?: string
  extra?: any
  input?: any
  result?: any
  children?: FlowTask[]
}

export interface FlowTaskConfig {
  isolateError?: boolean
}
