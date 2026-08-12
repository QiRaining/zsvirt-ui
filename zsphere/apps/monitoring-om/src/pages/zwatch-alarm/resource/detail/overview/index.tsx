import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import ConfigInfo from "./config-info";

interface IProps {
  current: ZWatchAlarmVO;
  source?: any;
  refetch?: any;
  resourceConfig?: any;
}

const Overview: React.FC<IProps> = ({ current, source }) => {
  const dataSet = useMemo(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo detail={current} {...props} />
        ),
      },
      configInfo: {
        resourceKey: "configInfo",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <ConfigInfo detail={current} source={source} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-vm"
      cols={2}
      dataSet={dataSet}
    />
  );
};

export default Overview;
