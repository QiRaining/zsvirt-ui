"use client";

import { cn } from "@zstack/utils";
import React, { createContext, useContext, useMemo } from "react";
import { useIntl } from "react-intl";

import NodataSelectSvg from "./assets/nodata-select.svg?react";
import NodataTableSvg from "./assets/nodata-table.svg?react";
import NodataWhiteTableSvg from "./assets/nodata-white-table.svg?react";

export type EmptyType = "Table" | "Select";

export interface EmptyProps {
  /** 空状态类型，Table 或 Select */
  type?: EmptyType;
  /** 描述文字 */
  description?: React.ReactNode;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否首次加载 */
  isFirst?: boolean;
  /** 自定义图片 */
  image?: React.ReactNode;
  /** 图片样式 */
  imageStyle?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * 安全渲染 SVG，兼容 React 组件（?react 导入）和 URL 字符串（MF 运行时回退）
 */
function renderSvgAsset(
  asset: string | React.ComponentType<React.SVGProps<SVGSVGElement>>,
  className?: string,
): React.ReactNode {
  if (typeof asset === "string") {
    return (
      <img
        src={asset}
        alt=""
        className={className}
        style={{ display: "block" }}
      />
    );
  }
  const SvgComponent = asset;
  return <SvgComponent className={className} />;
}

/**
 * 获取空状态图片组件
 */
function getEmptyImage(
  type: EmptyType,
  loading?: boolean,
  isFirst?: boolean,
): React.ReactNode {
  // 首次加载且 loading 状态时显示白色占位图
  if (loading && isFirst) {
    return renderSvgAsset(NodataWhiteTableSvg, "block");
  }

  if (type === "Select") {
    return renderSvgAsset(NodataSelectSvg, "block");
  }

  return renderSvgAsset(NodataTableSvg, "block");
}

/**
 * Empty 空状态组件
 *
 * 用于展示空数据状态，支持 Table 和 Select 两种类型
 */
export const Empty: React.FC<EmptyProps> = ({
  type = "Table",
  description,
  loading,
  isFirst,
  image,
  imageStyle,
  className,
  style,
  children,
}) => {
  const intl = useIntl();

  // 默认描述文字
  const defaultDescription = intl.formatMessage({
    id: "no.data",
    defaultMessage: "No Data",
  });

  // 首次加载且 loading 状态时不显示描述
  const showDescription = !(loading && isFirst);
  const displayDescription = description ?? defaultDescription;

  // 获取图片
  const imageNode = image ?? getEmptyImage(type, loading, isFirst);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        type === "Table" ? "py-8" : "py-4",
        className,
      )}
      style={style}
    >
      <div className="flex items-center justify-center" style={imageStyle}>
        {imageNode}
      </div>
      {showDescription && (
        <div
          className={cn(
            "mt-2 text-xs text-neutral-500",
            type === "Select" && "text-center",
          )}
        >
          {displayDescription}
        </div>
      )}
      {children}
    </div>
  );
};

// ============ ConfigEmptyProvider 相关 ============

interface EmptyConfigContextValue {
  type?: EmptyType;
  loading?: boolean;
  isFirst?: boolean;
  description?: React.ReactNode;
  imageStyle?: React.CSSProperties;
}

const EmptyConfigContext = createContext<EmptyConfigContextValue>({});

export interface ConfigEmptyProviderProps extends EmptyConfigContextValue {
  children?: React.ReactNode;
}

/**
 * ConfigEmptyProvider 空状态配置提供者
 *
 * 用于全局配置空状态组件的默认属性
 */
export const ConfigEmptyProvider: React.FC<ConfigEmptyProviderProps> = ({
  children,
  ...config
}) => {
  const value = useMemo(() => config, [config]);

  return (
    <EmptyConfigContext.Provider value={value}>
      {children}
    </EmptyConfigContext.Provider>
  );
};

/**
 * 使用空状态配置的 Hook
 */
export const useEmptyConfig = () => useContext(EmptyConfigContext);

/**
 * customRenderEmpty 自定义渲染空状态
 *
 * 用于在其他组件中渲染空状态，兼容老 API
 */
export function customRenderEmpty(props: {
  type?: string;
  description?: React.ReactNode;
  loading?: boolean;
  isFirst?: boolean;
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
}): React.ReactNode {
  const { type, ...rest } = props;
  return <Empty type={type === "Select" ? "Select" : "Table"} {...rest} />;
}

export default Empty;
