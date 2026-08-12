"use client";

import { cn } from "@zstack/utils";
import React from "react";

export interface IconTextProps {
  /** 图标组件 */
  icon?: React.ReactNode;
  /** 文本内容 */
  text?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 提示信息 */
  tooltip?: string;
  /** 点击事件 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否可点击 */
  clickable?: boolean;
}

/**
 * IconText 图标文本组件
 *
 * 用于显示带图标的可点击文本按钮
 *
 * @example
 * ```tsx
 * <IconText
 *   icon={<Icon type="edit" />}
 *   text="编辑"
 *   onClick={() => console.log('clicked')}
 * />
 * ```
 */
export const IconText: React.FC<IconTextProps> = ({
  icon,
  text,
  disabled = false,
  tooltip,
  onClick,
  className,
  style,
  clickable = true,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !clickable) return;
    onClick?.(event);
  };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1",
        "border-none bg-transparent p-0.5",
        "text-zsv-neutral-700",
        "transition-colors duration-200",
        clickable && !disabled && ["cursor-pointer", "hover:text-theme-600"],
        disabled && ["cursor-not-allowed", "opacity-50"],
        !clickable && "cursor-default",
        className,
      )}
      style={style}
      onClick={handleClick}
      disabled={disabled || !clickable}
      title={tooltip}
    >
      {icon && (
        <span className="inline-flex items-center justify-center">{icon}</span>
      )}
      {text && <span className="text-sm">{text}</span>}
    </button>
  );
};

IconText.displayName = "IconText";

export default IconText;
