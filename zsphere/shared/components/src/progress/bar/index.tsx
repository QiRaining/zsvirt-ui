import { usePersistFn } from "ahooks";
import { Progress as AntProgress, Tooltip, Row, Col, Space } from "antd";
import { ProgressProps } from "antd/es/progress";
import cls from "classnames";
import { isBoolean as _isBoolean, toNumber } from "lodash-es";
import React, { ReactNode } from "react";

import { getBaseCls } from "../../_utils/common";
import { getPercentStatus } from "../utils";
import type { IBarProgressProps } from "./type";

import "./style.less";

const baseCls = getBaseCls("progress-bar");

export const tuple = <T extends string[]>(...args: T) => args;

interface IOption {
  label: ReactNode;
  value: ReactNode;
}
export interface IProps extends Omit<
  ProgressProps,
  "mode" | "size" | "format" | "percent"
> {
  mode?: "light" | "dark";
  size?: "small" | "middle";
  colorful?: boolean;
  format?:
    | boolean
    | ((percent?: number, successPercent?: number) => React.ReactNode);
  needDecimal?: boolean;
  intable?: boolean;
  percent?: string | number;
  tooltipList?: IOption[];
}
const BarProgress: React.FC<IProps> = ({
  percent: _percent,
  style,
  className,
  size,
  mode,
  colorful = true,
  format: _format = true,
  needDecimal = true,
  intable = false,
  tooltipList,
  ...rest
}) => {
  const format = usePersistFn<
    (
      percent?: number | undefined,
      successPercent?: number | undefined,
    ) => React.ReactNode | undefined
  >((p, s) => {
    if (_isBoolean(_format)) {
      return _format ? `${p?.toFixed(0)}%` : `${p}%`;
    }
    return _format(p, s);
  });

  const percent = toNumber(_percent);

  const tooltipContent = tooltipList && (
    <Space direction="vertical" size={4} style={{ width: "100%" }}>
      {tooltipList.map(({ label, value }, index) => (
        <Row
          justify="space-between"
          gutter={4}
          key={index}
          style={{ fontSize: 12 }}
        >
          <Col>{label}</Col>
          <Col>{value}</Col>
        </Row>
      ))}
    </Space>
  );

  const el = (
    <div
      className={cls(baseCls, className, {
        [getBaseCls("progress-bar-padding-right")]: !intable && !_format,
      })}
      style={style}
    >
      <AntProgress
        type="line"
        className={cls(
          colorful
            ? `status-${getPercentStatus(percent)}`
            : getBaseCls("progress-themeColor"),
          { [getBaseCls(`progress-bar-small`)]: size === "small" },
          { [getBaseCls(`progress-bar-middle`)]: size === "middle" },
          { [getBaseCls(`progress-bar-small-in-table`)]: intable },
          { [getBaseCls("progress-bar-dark")]: mode === "dark" },
        )}
        percent={needDecimal ? toNumber(percent.toFixed(2)) : percent}
        format={format} //
        {...rest}
      />
    </div>
  );

  return tooltipContent ? (
    <Tooltip
      title={tooltipContent}
      overlayInnerStyle={{ minWidth: 200, padding: "8px 12px" }}
    >
      {el}
    </Tooltip>
  ) : (
    el
  );
};

export default BarProgress;

export type { IBarProgressProps };
