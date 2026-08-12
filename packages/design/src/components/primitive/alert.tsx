"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const alertVariants = cva(
  "relative flex flex-row items-center rounded-xs px-4 py-2.5",
  {
    variants: {
      variant: {
        danger: "bg-danger-50",
        warning: "bg-alert-50",
        info: "bg-info-50",
        positive: "bg-positive-50",
      },
      display: {
        strong: "", // 默认样式（浅色背景）
        weak: "bg-transparent p-0 py-1", // 无背景无边框
      },
    },
    defaultVariants: {
      variant: "info",
      display: "strong",
    },
  },
);

const closeIconVariants = cva(
  "absolute top-3 right-4 mt-0.5 ml-2 min-h-4 min-w-4 shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        danger: "text-danger-500 hover:text-danger-600",
        warning: "text-alert-500 hover:text-alert-600",
        info: "text-info-500 hover:text-info-600",
        positive: "text-positive-500 hover:text-positive-600",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  children: React.ReactNode;
  closable?: boolean;
  /**
   * 关闭时的回调
   */
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "info",
      display = "strong",
      children,
      closable,
      onClose,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(true);

    const handleClose = React.useCallback(() => {
      setVisible(false);
      onClose?.();
    }, [onClose]);

    if (!visible) {
      return null;
    }

    const iconClass = cn(
      "mr-2 min-h-4 min-w-4 shrink-0 translate-y-0.5",
      display === "weak" && "mr-1.5",
    );

    return (
      <div
        ref={ref}
        className={alertVariants({ variant, display, className })}
        {...props}
      >
        <div
          className={cn(
            "flex flex-1 flex-row text-sm text-neutral-700",
            display === "weak" && "text-xs text-neutral-500",
          )}
        >
          {variant === "danger" && (
            <Icon type="alert-triangle-fill"
              className={cn(iconClass, "text-danger-500")}
            />
          )}
          {variant === "warning" && (
            <Icon type="alert-triangle-fill"
              className={cn(iconClass, "text-alert-500")}
            />
          )}
          {variant === "info" && (
            <Icon type="info-fill" className={cn(iconClass, "text-info-500")} />
          )}
          {variant === "positive" && (
            <Icon type="checkmark-circle-fill"
              className={cn(iconClass, "text-positive-500")}
            />
          )}
          <div
            className={cn(
              `flex flex-1 flex-col break-words [&>h1]:m-0 [&>h1]:!text-white [&>h2]:m-0 [&>h2]:!text-white [&>h3]:m-0 [&>h3]:!text-sm [&>h3]:!text-white [&>h4]:m-0 [&>h4]:!text-white [&>h5]:m-0 [&>h5]:!text-white [&>h6]:m-0 [&>h6]:!text-white [&>ol]:!m-0 [&>ol]:list-outside [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:!m-0 [&>ul]:!m-0 [&>ul]:list-outside [&>ul]:list-disc [&>ul]:pl-3`,
              closable ? "pr-6" : "",
            )}
          >
            {children}
          </div>
        </div>
        {closable && (
          <Icon type="close"
            className={closeIconVariants({ variant })}
            onClick={handleClose}
          />
        )}
      </div>
    );
  },
);

Alert.displayName = "Alert";

export { Alert };
