"use client";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "group hover:!border-theme-600 h-3.5 w-3.5 rounded-xs !border !border-solid !border-neutral-400 " +
        " !bg-neutral-0 flex cursor-pointer items-center justify-center focus:outline-none " +
        " disabled:cursor-not-allowed disabled:!bg-neutral-200 disabled:hover:!border-neutral-400 " +
        " data-[state=checked]:!bg-theme-600 data-[state=checked]:!border-theme-600 data-[state=checked]:!text-neutral-0",
      "data-[state=checked]:disabled:!border-neutral-400 data-[state=checked]:disabled:!bg-neutral-400",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      {/* 根据状态显示不同图标 */}
      {props.checked === "indeterminate" ? (
        <div className="!bg-neutral-0 rounded-px h-2 w-2 group-disabled:!bg-neutral-400" />
      ) : (
        <Icon type="checkmark-2" className="!text-neutral-0 h-2 w-2" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
