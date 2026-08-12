"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@zstack/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-neutral-200",
  {
    variants: {
      size: {
        s: "h-1", // 4px
        m: "h-1.5", // 6px
        l: "h-2", // 8px
      },
      variant: {
        info: "[&>*]:bg-info-500",
        alert: "[&>*]:bg-yellow-500",
        danger: "[&>*]:bg-red-500",
      },
    },
    defaultVariants: {
      size: "m",
      variant: "info",
    },
  },
);

const indicatorVariants = cva("h-full w-full flex-1 transition-all", {
  variants: {
    variant: {
      info: "bg-info-500",
      alert: "bg-yellow-500",
      danger: "bg-red-500",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

export interface ProgressProps
  extends
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  /**
   * 进度值，范围 0-100
   */
  value?: number;
  /**
   * 是否翻转进度条方向
   * - false: 从左往右递增（默认）
   * - true: 从右往左递增
   * @default false
   */
  inverted?: boolean;
  /**
   * 变体颜色
   */
  variant?: "info" | "alert" | "danger";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      size,
      variant = "info",
      inverted = false,
      ...props
    },
    ref,
  ) => {
    // 计算指示器的样式
    const getIndicatorStyle = () => {
      if (inverted) {
        // 翻转模式：从右往左递增
        // 初始状态(value=0)：指示器完全不可见（translateX(100%)）
        // 结束状态(value=100)：指示器完全可见（translateX(0%)）
        return { transform: `translateX(${100 - value}%)` };
      }
      // 正常模式：从左往右递增
      // 初始状态(value=0)：指示器完全不可见（translateX(-100%)）
      // 结束状态(value=100)：指示器完全可见（translateX(0%)）
      return { transform: `translateX(-${100 - value}%)` };
    };

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ size, variant }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(indicatorVariants({ variant }))}
          style={getIndicatorStyle()}
        />
      </ProgressPrimitive.Root>
    );
  },
);

Progress.displayName = "Progress";

export { Progress };
