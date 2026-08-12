"use client";

import { cn } from "@zstack/utils";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import React, { useContext } from "react";

/**
 * 状态内容类型
 */
export type StateContentType = "text" | "tag" | "badge" | "dot";

/**
 * 状态属性
 */
export interface StateProps {
  /** 状态名称 */
  name: string;
  /** 内容类型 */
  contentType?: StateContentType;
  /** 颜色 */
  color?: string;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 常量组件属性
 */
export interface ConstantProps extends Partial<StateProps> {
  /** 常量值 */
  value: ConstantEnum;
  /** 枚举类型 */
  enumType?: ConstantType;
}

/**
 * 配置上下文（简化版本）
 */
interface ConfigContextValue {
  constant?: {
    constantMap?: Map<string, StateProps>;
    constantGroupMap?: Map<string, StateProps>;
  };
}

const ConfigContext = React.createContext<ConfigContextValue>({});

/**
 * 使用常量 Hook
 */
export function useConstant(
  value: ConstantEnum,
  enumType?: ConstantType,
): StateProps {
  const { constant } = useContext(ConfigContext);
  const originProps: StateProps = { name: String(value), contentType: "text" };

  if (enumType) {
    return (
      constant?.constantGroupMap?.get(`${enumType}-${value}`) || originProps
    );
  }
  return constant?.constantMap?.get(String(value)) || originProps;
}

/**
 * State 状态显示组件
 */
const State: React.FC<StateProps> = ({
  name,
  contentType = "text",
  color,
  backgroundColor,
  className,
}) => {
  const baseClasses = "inline-flex items-center";

  switch (contentType) {
    case "tag":
      return (
        <span
          className={cn(
            baseClasses,
            "rounded px-2 py-0.5 text-xs",
            "border-zsv-neutral-300 border",
            className,
          )}
          style={{ color, backgroundColor }}
        >
          {name}
        </span>
      );

    case "badge":
      return (
        <span
          className={cn(
            baseClasses,
            "rounded-full px-1.5 py-0.5 text-xs font-medium",
            className,
          )}
          style={{ color, backgroundColor }}
        >
          {name}
        </span>
      );

    case "dot":
      return (
        <span className={cn(baseClasses, "gap-1.5", className)}>
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: backgroundColor || color }}
          />
          <span style={{ color }}>{name}</span>
        </span>
      );

    case "text":
    default:
      return (
        <span className={cn(baseClasses, className)} style={{ color }}>
          {name}
        </span>
      );
  }
};

/**
 * Constant 常量组件
 *
 * 用于显示系统常量值，支持多种显示类型（文本、标签、徽章、圆点）
 *
 * @example
 * ```tsx
 * <Constant value="Running" enumType="VmInstanceState" />
 * ```
 */
export const Constant: React.FC<ConstantProps> = ({
  value,
  enumType,
  ...restProps
}) => {
  const stateProps = useConstant(value, enumType);
  return <State {...stateProps} {...restProps} />;
};

Constant.displayName = "Constant";

export { ConfigContext };
export default Constant;
