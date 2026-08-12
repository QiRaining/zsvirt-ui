"use client";

import { cn } from "@zstack/utils";
import React from "react";

export interface TitleProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 标题文本 */
  title: string;
  /** 资源名称（可选，显示在标题后） */
  resourceName?: string;
}

/**
 * Title 标题组件
 *
 * 用于显示页面或区块的标题，可选择性地显示资源名称
 *
 * @example
 * ```tsx
 * <Title title="虚拟机" resourceName="vm-001" />
 * ```
 */
export const Title = React.forwardRef<HTMLSpanElement, TitleProps>(
  ({ className, title, resourceName, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center", className)}
        {...props}
      >
        {title}
        {resourceName && (
          <span className="text-zsv-neutral-600 ml-2 font-normal">
            {resourceName}
          </span>
        )}
      </span>
    );
  },
);

Title.displayName = "Title";

export default Title;
