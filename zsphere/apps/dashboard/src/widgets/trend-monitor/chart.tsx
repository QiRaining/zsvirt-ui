import classNames from "classnames";
import React from "react";
import { ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

import style from "./style.module.less";

export interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}

/**
 * 轻量版图表容器，提供统一的 Recharts 样式包裹。
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div className={classNames(style.chartRoot, className)} {...rest}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  );
};

export const ChartTooltip = RechartsTooltip;
