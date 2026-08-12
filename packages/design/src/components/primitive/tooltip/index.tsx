/**
 * Tooltip 组件
 *
 * @description 提示组件，用于在用户 hover 或 focus 时显示额外信息
 *
 * @param className - 添加到 TooltipContent 的自定义样式类
 * @param title - 提示内容
 * @param placement - 提示内容显示方向
 * @param delayDuration - 提示显示延迟，默认 0 毫秒
 * @param disappearOnClick - 点击时是否消失，默认 true
 * @param arrowClassName - 箭头自定义样式类
 * @param zIndex - 自定义 z-index，不传则自动计算
 */

"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@zstack/utils";
import * as React from "react";

import { useOverlay } from "../../../utils/use-overlay";
import { usePlacement } from "./use-placement";

interface TooltipContentProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> {
  /** 自定义 z-index */
  zIndex?: number;
}

/** 提示内容组件 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, children, sideOffset = 4, zIndex, style, ...props }, ref) => {
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // 基础样式
        "max-w-80 rounded px-3 py-1.5",
        // 颜色
        "text-neutral-0 bg-neutral-700",
        // 文字
        "text-xs text-balance break-words",
        // 动画 - 使用 tw-animate-css
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        // 滑入方向
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        // 动画原点 - 使用 Radix 提供的 CSS 变量
        "origin-[var(--radix-tooltip-content-transform-origin)]",
        className,
      )}
      style={{ zIndex, ...style }}
      {...props}
    >
      {children}
    </TooltipPrimitive.Content>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/** 箭头组件 */
const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => {
  return (
    <TooltipPrimitive.Arrow
      ref={ref}
      className={cn("fill-neutral-700", className)}
      {...props}
    />
  );
});
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName;

export interface TooltipProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Root
> {
  className?: string;
  title: React.ReactNode;
  placement?:
    | "topLeft"
    | "top"
    | "topRight"
    | "leftTop"
    | "left"
    | "leftBottom"
    | "rightTop"
    | "right"
    | "rightBottom"
    | "bottomLeft"
    | "bottom"
    | "bottomRight";
  disappearOnClick?: boolean;
  arrowClassName?: string;
  /** 自定义 z-index，不传则自动计算 */
  zIndex?: number;
}

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipPortal = TooltipPrimitive.Portal;
const TooltipRoot = TooltipPrimitive.Root;

// 根组件
const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipProps
>(
  (
    {
      className,
      children,
      title,
      placement = "top",
      delayDuration = 0,
      disappearOnClick = true,
      onOpenChange,
      open,
      arrowClassName,
      zIndex: customZIndex,
      ...props
    },
    ref,
  ) => {
    // 内部控制 open 状态，用于 useOverlay
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (!isControlled) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [isControlled, onOpenChange],
    );

    // 使用 useOverlay 计算 z-index
    const { zIndex: autoZIndex } = useOverlay({
      type: "tooltip",
      open: isOpen,
      customZIndex,
    });
    const finalZIndex = customZIndex ?? autoZIndex;

    // 根据placement传参调整提示内容显示位置
    const { titleSide, titleAlign } = usePlacement(placement);
    if (title) {
      return (
        <TooltipProvider delayDuration={delayDuration} skipDelayDuration={0}>
          <TooltipRoot open={isOpen} onOpenChange={handleOpenChange}>
            <TooltipTrigger
              asChild={true}
              // 这里onClick和下面onPointerDownOutside都设置阻止冒泡是规避RadixUI的点击Trigger导致Tooltip自动消失的逻辑
              // https://github.com/radix-ui/primitives/issues/2029
              onClick={(event) => {
                if (!disappearOnClick) {
                  event.preventDefault();
                }
              }}
            >
              {children}
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                side={titleSide}
                align={titleAlign}
                className={className}
                ref={ref}
                zIndex={finalZIndex}
                onPointerDownOutside={(event) => {
                  if (!disappearOnClick) {
                    event.preventDefault();
                  }
                }}
                avoidCollisions
                collisionPadding={{ top: 20, bottom: 20, left: 20, right: 20 }}
                {...props}
              >
                {title}
                <TooltipArrow className={arrowClassName} />
              </TooltipContent>
            </TooltipPortal>
          </TooltipRoot>
        </TooltipProvider>
      );
    }
    return children;
  },
);
Tooltip.displayName = TooltipPrimitive.Root.displayName;

export {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
  TooltipProvider,
  TooltipRoot,
};
