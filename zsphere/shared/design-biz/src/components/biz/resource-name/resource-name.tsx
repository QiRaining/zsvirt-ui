"use client";

import { Text } from "@zstack/design";
import { cn } from "@zstack/utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export interface ResourceNameLinkProps {
  /** 资源 UUID */
  uuid?: string;
  /** 链接路径 */
  to?: string;
  /** 资源类型 */
  resourceType?: string;
}

export interface ResourceNameProps {
  /** 显示值 */
  value?: string | number | boolean | null;
  /** 是否可修改（影响空值显示） */
  canModify?: boolean;
  /** 前置图标 */
  icon?: React.ReactNode;
  /** 是否可复制 */
  copyable?: boolean;
  /** 是否显示省略号 */
  ellipsis?: boolean;
  /** 链接配置 */
  link?: ResourceNameLinkProps;
  /** 自定义类名 */
  className?: string;
  /** 是否由 Router 管理 */
  isRouterManaged?: boolean;
  /** 自定义链接组件（用于 react-router 集成） */
  LinkComponent?: React.ComponentType<{
    to: string;
    className?: string;
    children: React.ReactNode;
  }>;
}

/**
 * ResourceName 资源名称组件
 *
 * 用于显示资源名称，支持链接、复制、省略等功能
 *
 * @example
 * ```tsx
 * import { Link } from "react-router-dom";
 *
 * <ResourceName
 *   value="vm-001"
 *   link={{ uuid: "xxx", to: "/vm/xxx" }}
 *   LinkComponent={Link}
 * />
 * ```
 */
export const ResourceName: React.FC<ResourceNameProps> = ({
  value,
  canModify,
  icon,
  ellipsis = true,
  link,
  className,
  isRouterManaged = true,
  LinkComponent,
}) => {
  const intl = useIntl();

  const noneText = useMemo(() => {
    return intl.formatMessage({
      id: "NA",
      defaultMessage: "Empty",
    });
  }, [intl]);

  // 处理空值
  if (value === undefined || value === null || value === "") {
    const emptyClassName = cn(
      className,
      canModify && "text-theme-600 cursor-pointer",
    );
    const displayValue = canModify ? noneText : "-";

    if (link?.uuid) {
      return (
        <Text className={cn(ellipsis && "truncate", className)}>
          {link.uuid}
        </Text>
      );
    }
    return (
      <Text className={cn(ellipsis && "truncate", emptyClassName)}>
        {displayValue}
      </Text>
    );
  }

  // 处理布尔值
  if (typeof value === "boolean") {
    const boolText = value
      ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
      : intl.formatMessage({ id: "close", defaultMessage: "Disabled" });
    return (
      <Text className={cn(ellipsis && "truncate", className)}>{boolText}</Text>
    );
  }

  // 构建文本内容
  const textContent = icon ? (
    <span className="inline-flex items-center gap-1">
      <span className="flex-shrink-0">{icon}</span>
      <span>{value?.toString()}</span>
    </span>
  ) : (
    value?.toString()
  );

  const linkClassName = cn(
    "text-theme-600 hover:text-theme-500",
    "hover:underline",
    "transition-colors",
  );

  // 带链接的情况
  if (link?.uuid && link?.to) {
    const linkElement =
      isRouterManaged && LinkComponent ? (
        <LinkComponent to={link.to} className={linkClassName}>
          {textContent}
        </LinkComponent>
      ) : (
        <a href={link.to} className={linkClassName}>
          {textContent}
        </a>
      );

    return (
      <Text className={cn(ellipsis && "truncate", className)}>
        {linkElement}
      </Text>
    );
  }

  // 普通文本
  return (
    <Text className={cn(ellipsis && "truncate", className)}>{textContent}</Text>
  );
};

ResourceName.displayName = "ResourceName";

export default ResourceName;
