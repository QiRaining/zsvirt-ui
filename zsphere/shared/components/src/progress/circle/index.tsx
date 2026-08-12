import { Progress as AntProgress } from "antd";
import { ProgressProps } from "antd/es/progress";
import cls from "classnames";
import React from "react";

import { getBaseCls } from "../../_utils/common";
import { getPercentColor, getPercentStatus } from "../utils";

import "./style.less";
import type { ICircleProgressProps } from "./type";

const progressCls = getBaseCls("progress");
const baseCls = getBaseCls("progress-circle");

export interface IProps extends Omit<ProgressProps, "mode" | "size"> {
  size?: "small" | "middle" | "large";
}

const CircleProgress: React.FC<IProps> = ({
  percent = 50,
  size = "middle",
  style,
  className,
  ...rest
}) => {
  const getWidth = (width: string) => {
    if (width === "small") {
      return 20;
    }

    if (width === "large") {
      return 120;
    }

    return 48;
  };
  const strokeWidth = (width: string) => {
    if (width === "small") {
      return (4 * 100) / 20;
    }

    if (width === "large") {
      return (20 * 100) / 120;
    }

    return (8 * 100) / 48;
  };

  return (
    <AntProgress
      type="circle"
      showInfo={size === "large" && true}
      width={getWidth(size)}
      strokeWidth={strokeWidth(size)}
      strokeColor={getPercentColor(percent)}
      className={cls(
        progressCls,
        baseCls,
        `status-${getPercentStatus(percent)}`,
        className,
      )}
      style={style}
      format={(a) => (a === 0 ? `0%` : `${a?.toFixed(2)}%`)}
      percent={Number(percent.toFixed(2))}
      {...rest}
    />
  );
};

export default CircleProgress;

export type { ICircleProgressProps };
