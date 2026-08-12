import { Scope } from "@nestjs/common";

export enum JobBatch {
  PARTIAL = "PARTIAL",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

export interface ApiMetaData {
  jobBatch?: JobBatch;
  [key: string]: any;
}
export type ApiId = string;
export type TaskId = string;
export interface TaskInfo {
  apiMetaDataMap?: Map<ApiId, ApiMetaData>;
  [key: string]: any;
}
export interface ActionExecutionContext {
  actionId: string;
  currentTaskId: string;
  tasks: Map<TaskId, TaskInfo>;
  addTaskInfo: (taskId: TaskId, taskInfo: Partial<TaskInfo>) => void;
}

export const ActionExecutionContextProvider = {
  provide: "ActionExecutionContext",
  scope: Scope.REQUEST,
  useFactory: () => {
    const ctx: ActionExecutionContext = {
      actionId: "",
      currentTaskId: "",
      tasks: new Map(),
      addTaskInfo(taskId, taskInfo) {
        const prevTaskInfo = this.tasks.get(taskId);
        this.tasks.set(taskId, {
          ...prevTaskInfo,
          ...taskInfo,
        });
      },
    };
    return ctx;
  },
};
