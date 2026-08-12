"use client";

import { Text } from "@zstack/design";
import { Icon, type IconName } from "@zstack/icon";
import { cn } from "@zstack/utils";
import React, { memo } from "react";

export interface HeaderDetailProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** 图标，可以是图标类型字符串或自定义 React 元素 */
  icon?: IconName | React.ReactElement;
  /** 标题 */
  title: React.ReactElement | string;
  /** 操作按钮区域 */
  actions?: React.ReactElement;
  /** 字段信息区域 */
  fields?: React.ReactElement;
  /** 标题后缀组件 */
  suffix?: React.ComponentType<any>;
}

/**
 * 图标包装组件
 */
const IconWrapper: React.FC<{
  icon: IconName | React.ReactElement | undefined;
}> = ({ icon }) => {
  if (!icon) return null;

  if (React.isValidElement(icon)) {
    return <>{icon}</>;
  }

  return (
    <div
      className={cn(
        "h-12 w-12 rounded-lg",
        "bg-theme-600",
        "flex items-center justify-center",
      )}
    >
      <Icon type={icon as IconName} className="text-zsv-neutral-0 h-6 w-6" />
    </div>
  );
};

/**
 * 后缀组件包装
 */
const Suffix = memo(
  ({ suffix }: { suffix: React.ComponentType<any> | undefined }) => {
    if (!suffix) return null;
    return React.createElement(suffix);
  },
);

Suffix.displayName = "Suffix";

/**
 * HeaderDetail 详情页头部组件
 *
 * 用于资源详情页面的头部区域，包含图标、标题、操作按钮和字段信息
 *
 * @example
 * ```tsx
 * <HeaderDetail
 *   icon="vm"
 *   title="虚拟机-001"
 *   actions={<Button>启动</Button>}
 *   fields={<StatusBadge status="running" />}
 * />
 * ```
 */
export const HeaderDetail = React.forwardRef<HTMLDivElement, HeaderDetailProps>(
  ({ className, icon, title, actions, fields, suffix, ...props }, ref) => {
    const hasActions = Boolean(actions);
    const hasFields = Boolean(fields);
    const hasSuffix = Boolean(suffix);

    return (
      <div
        ref={ref}
        className={cn(
          "bg-zsv-neutral-0",
          "border-zsv-neutral-300 border-b",
          className,
        )}
        id="zstack-header-detail"
        {...props}
      >
        {/* 头部区域：图标 + 标题 + 操作 */}
        <div className="flex items-center gap-4 p-4">
          {/* 图标 */}
          {icon && (
            <div className="flex-shrink-0">
              <IconWrapper icon={icon} />
            </div>
          )}

          {/* 标题和操作区域 */}
          <div
            className={cn(
              "min-w-0 flex-1",
              "flex items-center justify-between",
              !hasActions && "pr-0",
            )}
          >
            {/* 标题 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-zsv-neutral-800 truncate text-xl font-semibold">
                  <Text>{title}</Text>
                </h1>
                {hasSuffix && <Suffix suffix={suffix} />}
              </div>
            </div>

            {/* 操作按钮 */}
            {hasActions && (
              <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* 字段信息区域 */}
        {hasFields && (
          <div className="px-4 pt-0 pb-4">
            <div className="flex flex-wrap gap-4">{fields}</div>
          </div>
        )}
      </div>
    );
  },
);

HeaderDetail.displayName = "HeaderDetail";

export default HeaderDetail;
