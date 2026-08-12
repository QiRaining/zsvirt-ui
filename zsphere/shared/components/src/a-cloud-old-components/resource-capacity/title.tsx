import { Icon } from "@zstack/icon";
import { Col, Row, Space, Tooltip } from "antd";
import { isNull } from "lodash-es";
import React, { FC, isValidElement } from "react";

import "./style.less";
import { ICapacityTitle, ITitleItem } from "./type";

const ResourceCapacityTitle: FC<ICapacityTitle> = ({ title }) => {
  if (typeof title === "object" && !isValidElement(title) && !isNull(title)) {
    const { label, icon, tooltip, extra } = title as ITitleItem;
    return (
      <Row
        justify="space-between"
        align="middle"
        gutter={4}
        className="capacity-title"
        wrap={false}
      >
        <Col>
          {tooltip ? (
            <Space size={4} align="center">
              {label}
              <Tooltip title={tooltip}>
                <Icon type={icon || "info"} />
              </Tooltip>
            </Space>
          ) : (
            label
          )}
        </Col>
        <Col>{extra}</Col>
      </Row>
    );
  }
  return <div className="capacity-title">{title}</div>;
};

export default ResourceCapacityTitle;
