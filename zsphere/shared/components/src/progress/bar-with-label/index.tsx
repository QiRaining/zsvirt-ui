import { Tooltip } from "antd";
import cls from "classnames";
import React, { ReactNode } from "react";

import { getBaseCls } from "../../_utils/common";
import BarProgress from "../bar";

import "./style.less";
import type { IBarWithLableProps } from "./type";

const progressCls = getBaseCls("progress-in-table");

export const tuple = <T extends string[]>(...args: T) => args;

export interface IProps extends Omit<
  IBarWithLableProps,
  "mode" | "size" | "format"
> {
  mode?: "light" | "dark";
  overlayStyle?: React.CSSProperties;
  overlayLabelStyle?: React.CSSProperties;
  tooltipTitle: ReactNode;
  labelLeftContent: ReactNode;
  labelRightContent: ReactNode;
}

const BarWithLable: React.FC<IProps> = ({
  overlayStyle,
  overlayLabelStyle,
  percent = 50,
  tooltipTitle,
  className,
  mode,
  showInfo = false,
  labelLeftContent,
  labelRightContent,
  ...rest
}) => (
  <Tooltip overlayClassName="ipCapacityTooltip" title={tooltipTitle}>
    <div
      className={cls(progressCls, className)}
      style={overlayStyle || { padding: "14px 0px 0px 0px" }}
    >
      <div style={overlayLabelStyle || { height: 20, fontSize: 12 }}>
        <div style={{ float: "left" }}>{labelLeftContent}</div>
        <div style={{ float: "right" }}> {labelRightContent} </div>
      </div>
      <BarProgress
        percent={percent}
        strokeColor={rest.strokeColor}
        showInfo={showInfo}
        size="small"
        mode={mode}
        intable
      />
    </div>
  </Tooltip>
);

export default BarWithLable;

export type { IBarWithLableProps };
