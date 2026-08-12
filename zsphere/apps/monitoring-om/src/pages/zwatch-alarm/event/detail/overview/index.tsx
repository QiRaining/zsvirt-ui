import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import BasicInfo from "./basic-info";
import ConfigInfo from "./config-info";

interface IProps {
  current: ZWatchAlarmVO;
  refetch?: any;
  resourceConfig?: any;
}

const Overview: React.FC<IProps> = ({ current, refetch, resourceConfig }) => {
  const _intl = useIntl();
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
          <ConfigInfo detail={current} {...props} />
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
