import { Col, Row } from "antd";
import React from "react";

import { DraggableCard } from "../a-cloud-old-components";
import { IBusinessMonitorCardProps } from "./type";

import style from "./style.module.less";

const BusinessMonitorCard: React.FC<IBusinessMonitorCardProps> = ({
  monitorKeys,
  children,
  singleColumn,
  ...cardProps
}) => {
  return (
    <DraggableCard {...cardProps}>
      <Row gutter={[12, 12]} className={style["card-container"]}>
        {monitorKeys.map((monitorKey, index) => {
          let span = 12;
          const isLast = index === monitorKeys.length - 1;
          const isOdd = monitorKeys.length % 2 === 1;
          if (isLast && isOdd) {
            span = 24;
          }
          return (
            <Col span={singleColumn ? 24 : span} key={monitorKey}>
              {React.Children.map(children, (child) => {
                // 只有当child是一个有效的元素时，我们才添加props
                if (React.isValidElement(child)) {
                  const childProps = { monitorKey };
                  return React.cloneElement(child, childProps);
                }
                return child;
              })}
            </Col>
          );
        })}
      </Row>
    </DraggableCard>
  );
};

export default React.memo(BusinessMonitorCard);
