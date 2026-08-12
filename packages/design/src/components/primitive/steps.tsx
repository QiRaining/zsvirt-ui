"use client";

import { cn } from "@zstack/utils";
import React from "react";

export interface StepItem {
  /**
   * 步骤标题
   */
  title: React.ReactNode;
  /**
   * 步骤描述（可选）
   */
  description?: React.ReactNode;
  /**
   * 是否禁用点击
   */
  disabled?: boolean;
  /**
   * 步骤图标（可选，仅在非 progressDot 模式下生效）
   */
  icon?: React.ReactNode;
}

export interface StepsProps {
  /**
   * 步骤配置项
   */
  items: StepItem[];
  /**
   * 当前步骤索引，从 0 开始
   * @default 0
   */
  current?: number;
  /**
   * 步骤条方向
   * @default "horizontal"
   */
  direction?: "horizontal" | "vertical";
  /**
   * 是否使用点状步骤条
   * @default false
   */
  progressDot?: boolean;
  /**
   * 点击步骤时的回调
   */
  onChange?: (current: number) => void;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * Steps 步骤条组件
 *
 * 引导用户按照流程完成任务的导航条。
 *
 * @example
 * ```tsx
 * <Steps
 *   current={1}
 *   progressDot
 *   direction="vertical"
 *   items={[
 *     { title: "基础配置" },
 *     { title: "资源配置" },
 *     { title: "系统配置" },
 *     { title: "预览" },
 *   ]}
 *   onChange={(current) => console.log(current)}
 * />
 * ```
 */
export const Steps: React.FC<StepsProps> = ({
  items,
  current = 0,
  direction = "horizontal",
  progressDot = false,
  onChange,
  className,
  style,
}) => {
  const isVertical = direction === "vertical";

  const handleStepClick = (index: number, disabled?: boolean) => {
    if (disabled || !onChange) {
      return;
    }
    onChange(index);
  };

  // 水平布局
  if (!isVertical) {
    return (
      <div
        className={cn("flex flex-row items-center", className)}
        style={style}
      >
        {items.map((item, index) => {
          const isActive = index === current;
          const isCompleted = index < current;
          const isDisabled = item.disabled;
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {/* 步骤项 */}
              <div
                className={cn(
                  "flex flex-col items-center",
                  onChange && !isDisabled && "cursor-pointer",
                  isDisabled && "cursor-not-allowed",
                )}
                onClick={() => handleStepClick(index, isDisabled)}
              >
                {/* 圆点/图标 */}
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center",
                    progressDot
                      ? "h-3 w-3 rounded-full"
                      : "h-6 w-6 rounded-full",
                    progressDot && {
                      "border-theme-500 border-2 border-solid bg-transparent":
                        isActive,
                      "bg-theme-500": isCompleted && !isActive,
                      "bg-neutral-400": !isActive && !isCompleted,
                    },
                    !progressDot && {
                      "bg-theme-500 text-neutral-0": isActive || isCompleted,
                      "bg-neutral-200 text-neutral-500":
                        !isActive && !isCompleted,
                      "text-xs font-medium": true,
                    },
                  )}
                >
                  {!progressDot && !item.icon && <span>{index + 1}</span>}
                  {!progressDot && item.icon}
                </div>

                {/* 标题 */}
                <div
                  className={cn("mt-2 text-center text-sm", {
                    "text-theme-500 font-medium": isActive,
                    "text-neutral-700": isCompleted && !isActive,
                    "text-neutral-500": !isActive && !isCompleted,
                  })}
                >
                  {item.title}
                </div>

                {/* 描述 */}
                {item.description && (
                  <div className="mt-1 text-center text-xs text-neutral-500">
                    {item.description}
                  </div>
                )}
              </div>

              {/* 连接线 */}
              {!isLast && (
                <div
                  className={cn(
                    "mx-3 h-0.5 min-w-8 flex-1",
                    isCompleted ? "bg-theme-300" : "bg-neutral-300",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // 垂直布局（右对齐，匹配产品样式）
  // 点状模式下，圆点高度(12px)比文字行高(22px)小，需要让圆点与文字第一行垂直居中对齐
  // 计算 margin-top: (22 - 12) / 2 = 5px
  const dotVerticalOffset = progressDot ? "mt-1" : "";

  return (
    <div className={cn("flex flex-col", className)} style={style}>
      {items.map((item, index) => {
        const isActive = index === current;
        const isCompleted = index < current;
        const isDisabled = item.disabled;
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex flex-row-reverse items-stretch">
            {/* 右侧：圆点 + 连接线 */}
            <div className="flex flex-col items-center">
              {/* 圆点 */}
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center",
                  progressDot ? "h-3 w-3 rounded-full" : "h-6 w-6 rounded-full",
                  dotVerticalOffset,
                  progressDot && {
                    "border-theme-500 border-2 border-solid bg-transparent":
                      isActive,
                    "bg-theme-500": isCompleted && !isActive,
                    "bg-neutral-400": !isActive && !isCompleted,
                  },
                  !progressDot && {
                    "bg-theme-500 text-neutral-0": isActive || isCompleted,
                    "bg-neutral-200 text-neutral-500":
                      !isActive && !isCompleted,
                    "text-xs font-medium": true,
                  },
                  onChange && !isDisabled && "cursor-pointer",
                  isDisabled && "cursor-not-allowed",
                )}
                onClick={() => handleStepClick(index, isDisabled)}
              >
                {!progressDot && !item.icon && <span>{index + 1}</span>}
                {!progressDot && item.icon}
              </div>

              {/* 连接线 */}
              {!isLast && (
                <div
                  className={cn(
                    "mt-1.5 min-h-12 w-0.5 flex-1",
                    isCompleted ? "bg-theme-300" : "bg-neutral-300",
                  )}
                />
              )}
            </div>

            {/* 左侧：标题 + 描述 */}
            <div
              className={cn(
                "mr-3 flex flex-col pb-6",
                isLast && "pb-0",
                onChange && !isDisabled && "cursor-pointer",
                isDisabled && "cursor-not-allowed",
              )}
              onClick={() => handleStepClick(index, isDisabled)}
            >
              <div
                className={cn("text-right text-sm", {
                  "text-theme-500 font-medium": isActive,
                  "text-neutral-700": isCompleted && !isActive,
                  "text-neutral-500": !isActive && !isCompleted,
                })}
              >
                {item.title}
              </div>
              {item.description && (
                <div className="mt-1 text-right text-xs text-neutral-500">
                  {item.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

Steps.displayName = "Steps";

export default Steps;
