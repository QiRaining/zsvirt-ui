"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import React from "react";

/**
 * 任务状态类型
 */
export type TaskStatus =
  | "Pending"
  | "Running"
  | "Success"
  | "Failed"
  | "Cancelled"
  | "Timeout"
  | string;

/**
 * 任务对象接口
 */
export interface Task {
  /** 任务 UUID */
  uuid?: string;
  /** 任务状态 */
  status: TaskStatus;
  /** 其他属性 */
  [key: string]: unknown;
}

export interface TaskDotProps {
  /** 任务对象 */
  task: Task;
  /** 是否选中 */
  checked: boolean;
  /** 点击回调 */
  onClick: (task: Task) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 获取状态对应的颜色类名
 */
const getStatusColorClass = (status: TaskStatus): string => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case "success":
      return "bg-zsv-positive-500";
    case "running":
    case "pending":
      return "bg-zsv-info-500";
    case "failed":
      return "bg-zsv-danger-500";
    case "cancelled":
    case "timeout":
      return "bg-zsv-alert-500";
    default:
      return "bg-zsv-neutral-400";
  }
};

/**
 * TaskDot 任务点组件
 *
 * 用于显示任务状态的小圆点，支持选中状态
 *
 * @example
 * ```tsx
 * <TaskDot
 *   task={{ uuid: "1", status: "Running" }}
 *   checked={false}
 *   onClick={(task) => console.log(task)}
 * />
 * ```
 */
export const TaskDot: React.FC<TaskDotProps> = ({
  task,
  checked,
  onClick,
  className,
}) => {
  const { status } = task;

  return (
    <div
      onClick={() => onClick(task)}
      className={cn(
        "h-4 w-4 rounded-full",
        "flex items-center justify-center",
        "cursor-pointer transition-all duration-200",
        "border-2 border-white shadow-sm",
        getStatusColorClass(status),
        checked && ["ring-theme-500 ring-2 ring-offset-1", "scale-110"],
        className,
      )}
    >
      {checked && (
        <Icon
          type="checkmark"
          className="text-white"
          style={{ fontSize: 10 }}
        />
      )}
    </div>
  );
};

TaskDot.displayName = "TaskDot";

export default TaskDot;
