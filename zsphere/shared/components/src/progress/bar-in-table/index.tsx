import { useSize } from "ahooks";
import { Tooltip, Row, Col, Space } from "antd";
import { toNumber, floor } from "lodash-es";
import React, { FC, ReactNode, useRef } from "react";

import { getBaseCls } from "../../_utils/common";
import BarProgress from "../bar";

import "./style.less";

interface IOption {
  label: ReactNode;
  value: ReactNode;
}

export interface IProps {
  percent?: string | number;
  needDecimal?: boolean;
  tooltipList?: IOption[];
  extra?: ReactNode;
}

const baseCls = getBaseCls("bar-in-table");

const BarInTable: FC<IProps> = ({
  tooltipList,
  percent: _percent,
  extra,
  needDecimal = true,
}) => {
  const percent = toNumber(_percent);

  const formattedPercent = needDecimal
    ? `${floor(percent, 2)}%`
    : `${floor(percent)}%`;

  const gapRef = useRef<HTMLDivElement>(null);
  const gapSize = useSize(gapRef);
  const hideExtra = !gapSize.width || gapSize.width <= 4;

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

  return (
    <Tooltip
      title={tooltipContent}
      overlayInnerStyle={{ minWidth: 200, padding: "8px 12px" }}
    >
      <Row justify="space-between" wrap={false} style={{ fontSize: 12 }}>
        <Col flex="0 0 auto">{formattedPercent}</Col>
        <Col flex={1} ref={gapRef} />
        <Col
          style={{ clipPath: hideExtra ? "circle(0)" : undefined }}
          flex="0 0 auto"
        >
          {extra}
        </Col>
      </Row>
      <BarProgress
        percent={percent}
        showInfo={false}
        size="small"
        intable
        className={baseCls}
      />
    </Tooltip>
  );
};

export default BarInTable;
