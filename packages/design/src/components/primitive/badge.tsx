"use client";
import { cn } from "@zstack/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import React from "react";

const badgeVariants = cva(
  "box-border inline-flex items-center justify-center rounded-xl font-medium",
  {
    variants: {
      variant: {
        // 基础徽标 - 灰色背景
        base: "bg-neutral-200 text-neutral-800",
        // 描边徽标 - 透明背景 + 灰色边框
        outline:
          "bg-transparent text-neutral-700 ring-1 ring-neutral-400 ring-inset",
        // 强烈徽标 - 提示色（蓝色）
        info: "bg-info-500 text-neutral-0",
        // 强烈徽标 - 危险色（红色）
        danger: "bg-danger-500 text-neutral-0",
        // 强烈徽标 - 警告色（橙色）
        alert: "bg-alert-500 text-neutral-0",
        // 强烈徽标 - 进行中（蓝色）
        inprogress: "bg-info-500 text-neutral-0",
        // 增加 - 绿色背景
        increase: "bg-positive-100 text-positive-600",
        // 减少 - 红色背景
        decrease: "bg-danger-100 text-danger-600",
      },
      size: {
        default: "h-4 px-1 text-xs leading-4",
        dot: "h-2 w-2 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "base",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * 徽标变体
   * - base: 基础徽标（灰色背景）
   * - outline: 描边徽标（透明背景 + 灰色边框）
   * - info: 提示徽标（蓝色）
   * - danger: 危险徽标（红色）
   * - alert: 警告徽标（橙色）
   * - inprogress: 进行中徽标（蓝色）
   * - increase: 增加徽标（绿色背景）
   * - decrease: 减少徽标（红色背景）
   */
  variant?:
    | "base"
    | "outline"
    | "info"
    | "danger"
    | "alert"
    | "inprogress"
    | "increase"
    | "decrease";
  /**
   * 徽标尺寸
   * - default: 默认尺寸（16px 高度）
   * - dot: 圆点尺寸（8px）
   */
  size?: "default" | "dot";
  /**
   * 徽标内容（数字或文本）
   */
  count?: number | string;
  /**
   * 最大显示数字，超过显示为 {max}+
   * @default 99
   */
  max?: number;
  /**
   * 是否显示为圆点
   */
  dot?: boolean;
}

/**
 * Badge 徽标组件
 *
 * 用于显示数字、状态或其他简短信息的小型徽标。
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Badge count={5} />
 *
 * // 不同变体
 * <Badge variant="danger" count={12} />
 * <Badge variant="info" count={99} />
 *
 * // 描边徽标（透明背景 + 边框）
 * <Badge variant="outline" count="默认" />
 *
 * // 圆点徽标
 * <Badge dot />
 * <Badge variant="danger" dot />
 *
 * // 自定义最大值
 * <Badge count={100} max={99} /> // 显示 99+
 *
 * // 增减徽标
 * <Badge variant="increase" count="+188" />
 * <Badge variant="decrease" count="-122" />
 * ```
 */
export const Badge = ({
  children,
  className,
  variant,
  size: sizeProp,
  count,
  max = 99,
  dot,
  ...rest
}: BadgeProps) => {
  // 如果设置了 dot 属性，强制使用 dot 尺寸
  const size = dot ? "dot" : sizeProp;

  // 处理显示内容
  const displayContent = React.useMemo(() => {
    // 如果是圆点模式，不显示内容
    if (dot) {
      return null;
    }

    // 如果有 children，优先显示 children
    if (children) {
      return children;
    }

    // 如果有 count
    if (count !== undefined && count !== null) {
      // 如果是字符串，直接显示
      if (typeof count === "string") {
        return count;
      }

      // 如果是数字，处理最大值
      if (typeof count === "number") {
        if (count > max) {
          return `${max}+`;
        }
        return count;
      }
    }

    return null;
  }, [children, count, max, dot]);

  // 如果没有内容且不是圆点模式，不渲染
  if (displayContent === null && !dot) {
    return null;
  }

  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...rest}>
      {displayContent}
    </span>
  );
};

/**
 * BadgeDot 圆点徽标组件（Badge 的快捷方式）
 *
 * @example
 * ```tsx
 * <BadgeDot />
 * <BadgeDot variant="danger" />
 * ```
 */
export const BadgeDot = ({
  variant = "danger",
  className,
  ...rest
}: Omit<BadgeProps, "dot" | "count" | "max" | "size">) => {
  return <Badge variant={variant} dot className={className} {...rest} />;
};
