"use client";
import { cn } from "@zstack/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import React from "react";

const statusBadgeVariants = cva(
  "text-neutral-0 inline-flex w-fit items-center gap-1 rounded-xs px-2 text-xs font-medium",
  {
    variants: {
      status: {
        pending: "bg-purple-500",
        inprogress: "bg-info-500",
        positive: "bg-positive-500",
        danger: "bg-danger-500",
        alert: "bg-alert-500",
        neutral: "bg-neutral-1000",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  },
);

export interface StatusBadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  /**
   * 状态类型
   * - pending: 队列/更新 (紫色)
   * - inprogress: 进行中 (蓝色)
   * - positive: 成功/正常/启用 (绿色)
   * - danger: 错误/危险 (红色)
   * - alert: 警告/异常 (橙色)
   * - neutral: 系统/停止/不可用 (灰色)
   */
  status?:
    | "pending"
    | "inprogress"
    | "positive"
    | "danger"
    | "alert"
    | "neutral";
}

export const StatusBadge = ({
  children,
  className,
  status,
  ...rest
}: StatusBadgeProps) => {
  return (
    <div className={cn(statusBadgeVariants({ status }), className)} {...rest}>
      {children}
    </div>
  );
};
