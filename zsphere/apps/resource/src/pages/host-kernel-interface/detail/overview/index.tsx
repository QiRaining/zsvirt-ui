import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { HostKernelInterface } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import NetworkConfig from "./network-config";

export interface IProps {
  current: HostKernelInterface;
}

const Overview: React.FC<IProps> = ({ current }) => {
  const dataSet = useMemo<
    Parameters<typeof ResponsiveDndCardsLayout>[0]["dataSet"]
  >(
    () => ({
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props) => <BasicInfo current={current} {...props} />,
      },
      networkConfig: {
        resourceKey: "networkConfig",
        x: 0,
        y: 1,
        node: (props) => <NetworkConfig current={current} {...props} />,
      },
    }),
    [current],
  );

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="host-kernel-interface"
      cols={1}
      dataSet={dataSet}
    />
  );
};

export default Overview;
