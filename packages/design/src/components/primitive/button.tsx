"use client";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@zstack/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import React from "react";

import { Loader } from "./loader";

const buttonVariants = cva(
  // 基础样式 + hover/active 过渡动画
  "inline-flex items-center justify-center rounded-xs border-0 whitespace-nowrap " +
    "focus-visible:ring-theme-500 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none " +
    "cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 " +
    // 简单的过渡动画：hover 背景色渐变 + 点击缩放
    "transition-all duration-150 ease-out active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-theme-600 text-neutral-0 hover:bg-theme-700 active:bg-theme-800",
        subtle:
          "bg-transparent text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300",
        // 一般 outline 会在表单里面用到，适配表单飘红的逻辑
        outline:
          "hover:text-theme-600 hover:border-theme-600 bg-transparent text-neutral-700 " +
          "border-1 border-dashed border-neutral-400 " +
          "aria-[invalid=true]:border-danger-500 aria-[invalid=true]:hover:border-danger-500 " +
          "aria-[invalid=true]:hover:text-danger-500 aria-[invalid=true]:text-danger-500 " +
          "disabled:hover:border-neutral-300 disabled:hover:text-neutral-700",
        secondary:
          "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 active:bg-neutral-400",
        // link 类型的按钮高度为文字行高，不需要缩放动画
        link:
          "text-theme-600 hover:text-theme-700 cursor-pointer " +
          "h-min bg-transparent p-0 disabled:text-neutral-500 disabled:opacity-100 " +
          "active:scale-100",
        danger:
          "bg-danger-600 text-neutral-0 hover:bg-danger-700 active:bg-danger-800",
        // ghost 类型的按钮适用于只包含图标的场景
        ghost:
          "bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 active:bg-neutral-200",
        ghost2:
          "bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200",
      },
      size: {
        default: "h-8 px-3 text-sm",
        sm: "h-7 px-2 text-xs",
        lg: "h-10 px-4 text-base",
        icon: "h-8 w-8",
        small: "h-7 px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** 按钮图标，显示在文字前面 */
  icon?: React.ReactNode;
  /** 加载状态，显示 Loader 并禁用按钮 */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      icon,
      loading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const displayIcon = loading ? <Loader /> : icon;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {displayIcon && <span className="shrink-0">{displayIcon}</span>}
        {displayIcon && children && <span className="w-1" />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
