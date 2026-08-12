import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { NvmeServer as INvmeServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import RelativeResource from "./relative-object";

interface IProps {
  current: INvmeServer;
  nvmeTargetUuid: string;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current, nvmeTargetUuid }) => {
  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo
            {...props}
            detail={current}
            nvmeTargetUuid={nvmeTargetUuid!}
          />
        ),
      },
      relativeResource: {
        resourceKey: "relativeResource",
        x: 0,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeResource detail={current} {...props} />
        ),
      },
    };

    return result;
  }, [current, nvmeTargetUuid]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-nvme-nqn"
      cols={1}
      dataSet={dataSet}
    />
  );
};

export default Overview;
