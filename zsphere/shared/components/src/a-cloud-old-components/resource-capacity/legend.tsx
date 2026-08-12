import { Row, Col, Space } from "antd";
import cls from "classnames";
import React, { FC } from "react";

import { IResourceCapacityLegend, IResourceCapacityType } from "./type";

import "./style.less";

const ResourceCapacityLegend: FC<IResourceCapacityLegend> = ({
  type,
  legend,
  isEmpty,
}) => {
  const isDistribution = type === IResourceCapacityType.Distribution;

  return (
    <Row gutter={[4, 4]} className="capacity-legend">
      {legend.map((legendItem, legendIndex) => (
        <Col span={24} key={legendIndex}>
          <Row justify="space-between" gutter={4}>
            <Col className="capacity-legend-label">
              {isDistribution ? (
                <Space align="center" size={8}>
                  <div
                    className={cls("capacity-legend-dot", {
                      [`capacity-legend-dot-${legendItem.color}`]:
                        !!legendItem.color,
                      "capacity-legend-dot-dash": legendItem.dash,
                    })}
                  />
                  {legendItem.label}
                </Space>
              ) : (
                legendItem.label
              )}
            </Col>
            <Col className="capacity-legend-value">
              {isEmpty ? "-" : legendItem.value}
            </Col>
          </Row>
        </Col>
      ))}
    </Row>
  );
};

export default ResourceCapacityLegend;
