import { cn } from "@zstack/utils";
import React from "react";

const GAP_CLASS = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-6",
} as const;

export interface FieldStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: keyof typeof GAP_CLASS;
}

export const FieldStack = React.forwardRef<HTMLDivElement, FieldStackProps>(
  ({ className, gap = "sm", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col", GAP_CLASS[gap], className)}
      {...props}
    />
  ),
);

FieldStack.displayName = "FieldStack";
