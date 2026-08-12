"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as React from "react";

import { useId } from "../../utils/use-id.ts";
import { Input } from "./input";

export interface InputPasswordProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type"
> {
  /**
   * 是否显示切换密码可见性的按钮
   * @default true
   */
  visibilityToggle?: boolean;
  /**
   * 自定义图标
   */
  iconRender?: (visible: boolean) => React.ReactNode;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(
  (
    { className, visibilityToggle = true, iconRender, disabled, ...props },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(false);
    // 等升级到React 18后，可以使用useId
    const id = useId();
    const onVisibilityChange = () => {
      if (disabled) {
        return;
      }
      setVisible((prev) => !prev);
    };

    const renderIcon = () => {
      if (iconRender) {
        return iconRender(visible);
      }
      return visible ? <Icon type="eye" /> : <Icon type="eye-off" />;
    };

    return (
      <div className="relative inline-flex">
        <Input
          id={props.id || id}
          {...props}
          disabled={disabled}
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            `pr-8`,
            {
              "[&:not(:placeholder-shown)]:tracking-widest": !visible,
              "tracking-normal": visible,
            },
            className,
          )}
        />
        {visibilityToggle && (
          <label
            htmlFor={props.id || id}
            className={cn(
              "absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-neutral-500",
              "hover:text-neutral-700",
              "inline-flex h-4 items-center justify-center",
              disabled &&
                "cursor-not-allowed text-neutral-300 hover:text-neutral-300",
            )}
            onClick={onVisibilityChange}
          >
            {renderIcon()}
          </label>
        )}
      </div>
    );
  },
);

InputPassword.displayName = "InputPassword";

export { InputPassword };
