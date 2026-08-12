"use client";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import React from "react";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer box-border h-4 w-8 shrink-0 cursor-pointer rounded-full border-0 " +
        "transition-colors focus-visible:ring-2 focus-visible:outline-none " +
        "relative focus-visible:ring-offset-2 disabled:cursor-not-allowed " +
        "data-[state=checked]:bg-theme-600 text-xs disabled:bg-neutral-300 data-[state=unchecked]:bg-neutral-400",
      className,
    )}
    {...props}
    ref={ref}
  >
    <Icon type="checkmark" className="absolute top-0.5 left-0.75 h-3 w-3 shrink-0 text-white" />
    <Icon type="close" className="absolute top-0.5 right-0.75 h-3 w-3 shrink-0 text-white" />
    <SwitchPrimitives.Thumb
      className={
        "bg-neutral-0 pointer-events-none absolute left-1.5 block h-3 w-3 rounded-full shadow-lg ring-0 transition-transform " +
        "group top-0.5 shrink-0 data-[state=checked]:translate-x-3 data-[state=unchecked]:-translate-x-1"
      }
    />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
