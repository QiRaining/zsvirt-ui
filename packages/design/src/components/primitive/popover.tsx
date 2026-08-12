"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@zstack/utils";
import * as React from "react";

import { useOverlay } from "../../utils/use-overlay";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> {
  popoverPortalProps?: React.ComponentPropsWithoutRef<
    typeof PopoverPrimitive.Portal
  >;
  zIndex?: number; // 自定义 z-index
  open?: boolean; // 用于触发 z-index 计算
  disableAutoZIndex?: boolean; // 是否禁用自动 z-index 管理
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      popoverPortalProps,
      zIndex: customZIndex,
      open = true,
      disableAutoZIndex = false,
      ...props
    },
    ref,
  ) => {
    // 自动管理 z-index
    const { zIndex: autoZIndex } = useOverlay({
      type: "popover",
      open: open && !disableAutoZIndex,
      customZIndex,
    });

    // 最终使用的 z-index：优先使用自定义值，其次使用自动计算值
    const finalZIndex = customZIndex ?? (disableAutoZIndex ? 1030 : autoZIndex);

    return (
      <PopoverPrimitive.Portal {...popoverPortalProps}>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-xs border border-solid border-transparent p-4 shadow-md outline-none",
            className,
          )}
          style={{ zIndex: finalZIndex }}
          {...props}
        />
      </PopoverPrimitive.Portal>
    );
  },
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
