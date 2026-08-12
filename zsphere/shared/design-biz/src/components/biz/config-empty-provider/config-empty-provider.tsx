"use client";

import { cn } from "@zstack/utils";
import React from "react";
import { useIntl, RawIntlProvider } from "react-intl";

import NodataSelectSrc from "../../empty/assets/nodata-select.svg";
import NodataTableSrc from "../../empty/assets/nodata-table.svg";
// 导入空状态图片
import NodataWhiteTableSrc from "../../empty/assets/nodata-white-table.svg";

export interface EmptyProps {
  /** 空状态类型 */
  type?: "Table" | "Select";
  /** 是否加载中 */
  loading?: boolean;
  /** 是否首次加载 */
  isFirst?: boolean;
  /** 描述文本 */
  description?: React.ReactNode;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 图片样式 */
  imageStyle?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * 安全渲染 SVG 图片
 */
function renderSvgImage(
  src: string | React.ComponentType<React.SVGProps<SVGSVGElement>>,
) {
  if (typeof src === "string") {
    return <img src={src} alt="" style={{ display: "block" }} />;
  }
  const SvgComponent = src;
  return <SvgComponent />;
}

/**
 * 获取空状态属性
 */
function getEmptyProps(props: EmptyProps) {
  const type = props.type || "Table";

  if (props?.loading && props?.isFirst) {
    return {
      image: renderSvgImage(NodataWhiteTableSrc),
      description: "",
      className: cn("zsv-empty-table", props.className),
    };
  }

  return {
    image: renderSvgImage(type === "Table" ? NodataTableSrc : NodataSelectSrc),
    description: props.description,
    className: cn(
      type === "Table" ? "zsv-empty-table" : "zsv-empty-select",
      props.className,
    ),
    style: props.style,
    imageStyle: props.imageStyle,
  };
}

/**
 * 自定义空状态渲染函数
 */
export function customRenderEmpty({
  type,
  ...rest
}: {
  type?: string;
  description?: React.ReactNode;
  loading?: boolean;
  isFirst?: boolean;
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
}) {
  const emptyProps = getEmptyProps({
    type: type === "Select" ? "Select" : "Table",
    ...rest,
  });

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8",
        emptyProps.className,
      )}
      style={emptyProps.style}
    >
      <div style={emptyProps.imageStyle}>{emptyProps.image}</div>
      {emptyProps.description && (
        <div className="text-zsv-neutral-500 mt-2 text-sm">
          {emptyProps.description}
        </div>
      )}
    </div>
  );
}

/**
 * ConfigEmptyProvider 配置空状态提供者
 *
 * 为子组件提供统一的空状态渲染配置
 *
 * @example
 * ```tsx
 * <ConfigEmptyProvider>
 *   <Table dataSource={[]} />
 * </ConfigEmptyProvider>
 * ```
 */
export const ConfigEmptyProvider: React.FC<EmptyProps> = ({
  children,
  ...rest
}) => {
  const intl = useIntl();

  // 创建一个上下文来传递空状态配置
  return (
    <RawIntlProvider value={intl}>
      <ConfigEmptyContext.Provider value={rest}>
        {children}
      </ConfigEmptyContext.Provider>
    </RawIntlProvider>
  );
};

/**
 * 空状态配置上下文
 */
export const ConfigEmptyContext = React.createContext<
  Omit<EmptyProps, "children">
>({});

/**
 * 使用空状态配置 Hook
 */
export const useConfigEmpty = () => {
  return React.useContext(ConfigEmptyContext);
};

ConfigEmptyProvider.displayName = "ConfigEmptyProvider";

export default ConfigEmptyProvider;
