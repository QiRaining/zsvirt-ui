import cls from "classnames";
import React from "react";

import { getBaseCls } from "../_utils/common";

import "./icon-text.less";

const baseCls = getBaseCls("icon-text");

export interface IconTextProps {
  /** 图标组件，支持@zstack/icon的图标 */
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
  /** 其他属性 */
  [key: string]: unknown;
}

const IconText: React.FC<IconTextProps> = ({
  icon,
  text,
  disabled = false,
  tooltip,
  onClick,
  className,
  style,
  clickable = true,
  ...restProps
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !clickable) return;
    onClick?.(event);
  };

  return (
    <button
      type="button"
      className={cls(
        baseCls,
        {
          [`${baseCls}-disabled`]: disabled,
          [`${baseCls}-clickable`]: clickable && !disabled,
        },
        className,
      )}
      style={{
        ...style,
        background: "transparent",
        border: "none",
        padding: "2px 0px",
        cursor: clickable && !disabled ? "pointer" : "default",
      }}
      onClick={handleClick}
      disabled={disabled || !clickable}
      title={tooltip}
      {...restProps}
    >
      {icon && <span className={`${baseCls}-icon`}>{icon}</span>}
      {text && <span className={`${baseCls}-text`}>{text}</span>}
    </button>
  );
};

export default IconText;
