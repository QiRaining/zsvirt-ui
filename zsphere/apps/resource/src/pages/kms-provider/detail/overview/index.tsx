import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { Item } from "@zstack/zsphere-types";
import React from "react";

import BasicInfo from "./basic-info";

interface IProps {
  current: Item;
}

const Overview: React.FC<IProps> = ({ current }) => {
  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="kms-provider-overview"
      cols={1}
      dataSet={{
        basicInfo: {
          resourceKey: "basicInfo",
          x: 0,
          y: 0,
          node: (props) => <BasicInfo current={current} {...props} />,
        },
      }}
    />
  );
};

export default Overview;
