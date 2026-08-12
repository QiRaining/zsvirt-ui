"use client";

import { cn } from "@zstack/utils";
import React from "react";
import { useIntl } from "react-intl";

export interface HeaderListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 标题 */
  title: string;
  /** 描述文本 */
  description?: React.ReactNode;
  /** 额外操作区域 */
  extra?: React.ReactNode;
  /** 文档路径，用于"了解更多"链接 */
  docReaderPath?: string;
  /** 自定义描述区域 */
  customDescription?: React.ReactNode;
  /** 点击"了解更多"的回调 */
  onDocClick?: (path: string) => void;
}

/**
 * HeaderList 列表页头部组件
 *
 * 用于列表页面的头部区域，包含标题、描述和操作区域
 *
 * @example
 * ```tsx
 * <HeaderList
 *   title="虚拟机列表"
 *   description="管理所有虚拟机资源"
 *   extra={<Button>创建</Button>}
 * />
 * ```
 */
export const HeaderList = React.forwardRef<HTMLDivElement, HeaderListProps>(
  (
    {
      className,
      title,
      description,
      extra,
      docReaderPath,
      customDescription,
      onDocClick,
      ...props
    },
    ref,
  ) => {
    const intl = useIntl();

    const handleDocClick = () => {
      if (docReaderPath && onDocClick) {
        onDocClick(docReaderPath);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start justify-between px-6 py-4",
          "bg-zsv-neutral-0",
          className,
        )}
        {...props}
      >
        <div className="min-w-0 flex-1">
          {title && (
            <h1
              className={cn(
                "text-zsv-neutral-800 text-lg font-semibold",
                "truncate",
              )}
              title={typeof title === "string" ? title : undefined}
            >
              {title}
            </h1>
          )}
          {description && (
            <div className="mt-1 flex items-center gap-2">
              <span
                className="text-zsv-neutral-600 truncate text-sm"
                title={
                  typeof description === "string" ? description : undefined
                }
              >
                {description}
              </span>
              {docReaderPath && onDocClick && (
                <button
                  type="button"
                  className={cn(
                    "text-theme-600 hover:text-theme-500 text-sm",
                    "cursor-pointer whitespace-nowrap",
                  )}
                  onClick={handleDocClick}
                >
                  {intl.formatMessage({
                    id: "understandMore",
                    defaultMessage: " Learn more.",
                  })}
                </button>
              )}
            </div>
          )}
          {customDescription && (
            <div className="text-zsv-neutral-600 mt-1 text-sm">
              {customDescription}
            </div>
          )}
        </div>
        {extra && <div className="ml-6 flex-shrink-0">{extra}</div>}
      </div>
    );
  },
);

HeaderList.displayName = "HeaderList";

export default HeaderList;
