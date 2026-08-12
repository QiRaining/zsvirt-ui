import { Row, Col } from "antd";
import React, { FC } from "react";

import { getBaseCls } from "../../_utils/common";
import ResourceCapacityLegend from "./legend";
import ResourceCapacityName from "./name";
import ResourceCapacityProgress from "./progress";
import ResourceCapacityTitle from "./title";
import { IResourceCapacity, IResourceCapacityType } from "./type";

import "./style.less";

const baseCls = getBaseCls("resource-capacity");

const ResourceCapacity: FC<IResourceCapacity> = ({
  type,
  title,
  name,
  progress,
  legend,
  isEmpty,
  direction = "vertical",
}) => {
  if (direction === "vertical") {
    return (
      <div className={baseCls}>
        {title && <ResourceCapacityTitle title={title} />}
        {name && <ResourceCapacityName name={name} isEmpty={isEmpty} />}
        <ResourceCapacityProgress
          type={type}
          progress={progress}
          isEmpty={isEmpty}
        />
        {legend && (
          <div style={{ marginTop: 8 }}>
            <ResourceCapacityLegend
              type={type}
              legend={legend}
              isEmpty={isEmpty}
            />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={baseCls}>
      {title && <ResourceCapacityTitle title={title} />}
      <Row
        wrap={false}
        align="middle"
        className="capacity-row-with-divider"
        gutter={40}
      >
        <Col flex="0 1 45%">
          {name && <ResourceCapacityName name={name} isEmpty={isEmpty} />}
          <ResourceCapacityProgress
            type={type}
            progress={progress}
            isEmpty={isEmpty}
          />
        </Col>
        <Col flex="0 1 55%">
          {legend && (
            <ResourceCapacityLegend
              type={type}
              legend={legend}
              isEmpty={isEmpty}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ResourceCapacity;
export { ResourceCapacityProgress, IResourceCapacityType };
