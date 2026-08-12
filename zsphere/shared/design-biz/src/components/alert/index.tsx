import {
  Alert as DesignAlert,
  type AlertProps as DesignAlertProps,
} from "@zstack/design";
import { cn } from "@zstack/utils";
import * as React from "react";

export interface GuideAction {
  text: React.ReactNode;
  onClick?: () => void;
}

export interface AlertProps extends DesignAlertProps {
  /**
   * 引导操作，显示在消息文本右侧的可点击链接
   */
  guideAction?: GuideAction;
  /**
   * 额外操作区域，显示在消息内容右侧
   */
  extraAction?: React.ReactNode;
}

const variantLinkClass = {
  danger: "text-danger-500 hover:text-danger-600",
  warning: "text-alert-500 hover:text-alert-600",
  info: "text-info-500 hover:text-info-600",
  positive: "text-positive-500 hover:text-positive-600",
} as const;

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      children,
      guideAction,
      extraAction,
      variant = "info",
      className,
      ...props
    },
    ref,
  ) => {
    const hasActions = guideAction || extraAction;

    if (!hasActions) {
      return (
        <DesignAlert
          ref={ref}
          variant={variant}
          className={className}
          {...props}
        >
          {children}
        </DesignAlert>
      );
    }

    const closable = props.closable;
    const linkClass = variantLinkClass[variant ?? "info"];

    // When closable, the close icon is absolutely positioned at top-right (right-4 = 16px).
    // We need enough right padding so children and guideAction don't cramp the icon.
    const rightPaddingClass = closable ? "pr-16" : "";

    // Build the message content: children + guideAction in a flex row with gap
    // Only wrap children in a div if it's a React element (not plain text).
    // This ensures text stays inline with guideAction in the row layout.
    const isReactElement = React.isValidElement(children);
    const messageContent = (
      <>
        {isReactElement ? <div>{children}</div> : children}
        {guideAction && (
          <span
            className={cn("shrink-0 cursor-pointer", linkClass)}
            onClick={guideAction.onClick}
          >
            {guideAction.text}
          </span>
        )}
      </>
    );

    return (
      <DesignAlert
        ref={ref}
        variant={variant}
        className={cn(
          // Override content div to be flex-row when there are actions
          "[&>div>div:last-child]:!flex-row [&>div>div:last-child]:!flex-wrap [&>div>div:last-child]:!items-center",
          // Add right padding when closable so children/actions don't cramp the close icon
          rightPaddingClass,
          className,
        )}
        {...props}
      >
        {messageContent}
        {extraAction}
      </DesignAlert>
    );
  },
);

Alert.displayName = "Alert";

export { Alert };
