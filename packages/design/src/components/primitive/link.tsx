"use client";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@zstack/utils";
import React from "react";

import type { TextProps } from "./text";
import { Text } from "./text";

export interface LinkProps extends Omit<TextProps, "as"> {
  /**
   * 当设置为 true 时，Link 会将其所有 props 和样式传递给子元素
   * 这样可以将任何元素（如 <a> 标签、React Router 的 Link）渲染为链接样式
   * @default false
   */
  asChild?: boolean;
}

export const Link = React.forwardRef<HTMLDivElement, LinkProps>(
  ({ children, className, asChild = false, ...rest }, ref) => {
    const linkClassName = cn(
      "text-theme-600 cursor-pointer hover:opacity-80",
      className,
    );

    // 当使用 asChild 时，直接使用 Slot 传递样式给子元素
    if (asChild) {
      return (
        <Slot className={linkClassName} ref={ref} {...rest}>
          {children}
        </Slot>
      );
    }

    // 默认使用 Text 组件，保留溢出提示功能
    return (
      <Text role="link" className={linkClassName} {...rest}>
        {children}
      </Text>
    );
  },
);

Link.displayName = "Link";
