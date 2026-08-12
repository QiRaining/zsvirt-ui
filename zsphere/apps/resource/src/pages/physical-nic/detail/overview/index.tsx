import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";

import BasicInfo from "./basic-info";
import ConfigInfo from "./config-info";

interface IProps {
  current: PhysicalNic;
}

const Overview: FC<IProps> = ({ current }) => {
  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-host-physical-nic-overview"
      cols={1}
      dataSet={{
        basicInfo: {
          resourceKey: "basicInfo",
          x: 0,
          y: 0,
          node: (props) => <BasicInfo current={current} {...props} />,
        },
        configInfo: {
          resourceKey: "configInfo",
          x: 0,
          y: 1,
          node: (props) => <ConfigInfo current={current} {...props} />,
        },
      }}
    />
  );
};

export default Overview;
