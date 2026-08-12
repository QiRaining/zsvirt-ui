"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as React from "react";
import { useIntl } from "react-intl";

import { Button } from "./button";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

export interface PopoverConfirmProps {
  /** 确认提示标题 */
  title: React.ReactNode;
  /** 确认提示描述（可选） */
  description?: React.ReactNode;
  /** 确认回调 */
  onConfirm?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 图标类型 */
  type?: "warning" | "danger" | "info";
  /** 是否禁用 */
  disabled?: boolean;
  /** 弹出位置 */
  side?: "top" | "right" | "bottom" | "left";
  /** 对齐方式 */
  align?: "start" | "center" | "end";
  /** 子元素（触发器） */
  children: React.ReactNode;
  /** 自定义 className */
  className?: string;
  /** 控制显示状态（受控模式） */
  open?: boolean;
  /** 显示状态变化回调（受控模式） */
  onOpenChange?: (open: boolean) => void;
}

const iconConfig = {
  warning: {
    type: "alert-triangle-fill" as const,
    className: "text-alert-500",
  },
  danger: {
    type: "alert-triangle-fill" as const,
    className: "text-danger-500",
  },
  info: {
    type: "info-fill" as const,
    className: "text-info-500",
  },
};

export const PopoverConfirm: React.FC<PopoverConfirmProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  type = "warning",
  disabled = false,
  side = "right",
  align = "center",
  children,
  className,
  open: controlledOpen,
  onOpenChange,
}) => {
  const intl = useIntl();
  const [internalOpen, setInternalOpen] = React.useState(false);

  // 支持受控和非受控模式
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (value: boolean) => onOpenChange?.(value)
    : setInternalOpen;

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (disabled && newOpen) {
      return;
    }
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const iconCfg = iconConfig[type];

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className={cn("w-auto max-w-75 min-w-50 p-3", className)}
        open={open}
      >
        <div className="flex gap-2">
          <Icon
            type={iconCfg.type}
            className={cn("mt-0.5 h-4 w-4 shrink-0", iconCfg.className)}
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-800">{title}</div>
            {description && (
              <div className="mt-1 text-xs text-neutral-500">{description}</div>
            )}
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="subtle" className="h-7 px-2" onClick={handleCancel}>
            {cancelText ??
              intl.formatMessage({ id: "cancel", defaultMessage: "取消" })}
          </Button>
          <Button
            variant={type === "danger" ? "danger" : "primary"}
            className="h-7 px-2"
            onClick={handleConfirm}
          >
            {confirmText ??
              intl.formatMessage({ id: "confirm", defaultMessage: "确定" })}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

PopoverConfirm.displayName = "PopoverConfirm";
