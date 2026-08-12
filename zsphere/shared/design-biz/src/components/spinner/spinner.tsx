"use client";

import { Spin, type SpinProps } from "@zstack/design";
import { cn } from "@zstack/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

/**
 * 尺寸映射：将 sm/md/lg 映射到 @zstack/design Spin 组件的 small/medium/large
 */
const sizeMap = {
  sm: "small",
  md: "medium",
  lg: "large",
} as const;

const spinnerVariants = cva("", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps
  extends Omit<SpinProps, "size">, VariantProps<typeof spinnerVariants> {
  /**
   * 是否为加载中状态
   * @default true
   */
  spinning?: boolean;
  /**
   * 组件大小
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 加载提示文字
   */
  tip?: React.ReactNode;
  /**
   * 包裹的内容，spinning 时显示遮罩
   */
  children?: React.ReactNode;
  /**
   * 延迟显示加载效果的时间（防止闪烁，单位：毫秒）
   * @default 0
   */
  delay?: number;
  /**
   * 是否全屏显示
   * @default false (与 antd Spin 保持一致，默认非全屏)
   */
  fullscreen?: boolean;
  /**
   * 自定义加载指示器
   */
  indicator?: React.ReactNode;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义加载指示器的类名
   */
  indicatorClassName?: string;
  /**
   * 自定义 tip 的类名
   */
  tipClassName?: string;
}

/**
 * Spinner 加载组件
 *
 * 基于 @zstack/design 的 Spin 组件封装，提供统一的加载状态展示。
 *
 * @example
 * // 基础用法
 * <Spinner spinning />
 *
 * @example
 * // 带提示文字
 * <Spinner spinning tip="加载中..." />
 *
 * @example
 * // 包裹内容
 * <Spinner spinning tip="数据加载中...">
 *   <div>内容区域</div>
 * </Spinner>
 *
 * @example
 * // 不同尺寸
 * <Spinner size="sm" spinning />
 * <Spinner size="md" spinning />
 * <Spinner size="lg" spinning />
 */
const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      spinning = true,
      size = "md",
      tip,
      children,
      delay,
      fullscreen = false,
      indicator,
      className,
      indicatorClassName,
      tipClassName,
      ...props
    },
    ref,
  ) => {
    // 将 sm/md/lg 映射到 Spin 组件的 small/medium/large
    const mappedSize = sizeMap[size];

    return (
      <Spin
        ref={ref}
        spinning={spinning}
        size={mappedSize}
        tip={tip}
        delay={delay}
        fullscreen={fullscreen}
        indicator={indicator}
        className={cn(spinnerVariants({ size }), className)}
        indicatorClassName={indicatorClassName}
        tipClassName={tipClassName}
        {...props}
      >
        {children}
      </Spin>
    );
  },
);

Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
