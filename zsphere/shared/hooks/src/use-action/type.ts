import type { DocumentNode } from "@apollo/client";
import type React from "react";

export interface IActionResult {
  name?: string;
  total: number;
  current: number;
  success: number;
  suspended: number;
  running: number;
  fail: number;
  exception: number;
  inventory?: any;
  createDate?: number;
  messageDestroyed?: boolean;
  actionId?: string;
  successMessage?: string | React.ReactNode;
  silent?: boolean;
}

export interface ITaskResult {
  current: number;
  inventory: any;
  error: any;
  id?: string;
}

export interface IActionParams<T = any> {
  mutation: DocumentNode;
  name?: string;
  total: number;
  payload: T;
  middleState?: {
    type: string;
    uuids: string[];
    field: string;
    data: any;
  };
  refetchPolicy?: "progress" | "finish";
  type?: string;
  // 强制执行 onProgress，onFinish 回调。只有在回调中不修改状态时，才可以设置为 true。
  forceRunCallback?: boolean;
  successMessage?: string | React.ReactNode;
  onProgress?: (result: ITaskResult) => void;
  onFinish?: (result: IActionResult) => void;
  silent?: boolean;
}

export enum MiddleState {
  Running = "Running",
}
