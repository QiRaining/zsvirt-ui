import { Icon } from "@zstack/icon";
import { Row, Col, Tooltip, Space } from "antd";
import React, { FC } from "react";
import { useIntl } from "react-intl";

import { ICapacityName, INameItem } from "./type";

import "./style.less";

const ResourceCapacityName: FC<ICapacityName> = ({ name, isEmpty }) => {
  const intl = useIntl() as any;
  const noData = (
    <span className="no-data">
      {intl.formatMessage({
        id: "no.data",
        defaultMessage: "No Data",
      })}
    </span>
  );
  if (typeof name === "object") {
    const { label, value, icon, tooltip } = name as INameItem;
    return (
      <Row justify="space-between" gutter={4} className="capacity-name">
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
        <Col>{isEmpty ? noData : value}</Col>
      </Row>
    );
  }
  return isEmpty ? noData : <div className="capacity-name">{name}</div>;
};

export default ResourceCapacityName;
