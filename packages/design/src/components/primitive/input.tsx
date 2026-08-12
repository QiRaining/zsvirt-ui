"use client";
import { cn } from "@zstack/utils";
import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "bg-neutral-0 box-border flex h-8 rounded-xs border border-solid border-neutral-400 px-3 " +
            "hover:border-theme-600 text-sm text-neutral-700 file:border-0 file:bg-transparent file:text-sm file:font-medium " +
            " focus-visible:border-theme-600 focus-visible:ring-2 focus-visible:outline-none disabled:bg-neutral-100 disabled:hover:border-neutral-400 " +
            "focus-visible:ring-theme-50 placeholder:text-neutral-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:text-neutral-500 disabled:placeholder:text-neutral-500 " +
            "aria-[invalid=true]:border-danger-500 aria-[invalid=true]:focus-visible:border-danger-500 aria-[invalid=true]:focus-visible:ring-danger-50 aria-[invalid=true]:hover:border-danger-500",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
