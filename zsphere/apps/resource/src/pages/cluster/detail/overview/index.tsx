import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useMemo } from "react";

import BasicInfo from "./basic-info";
import CapacityUsage from "./capacity-usage";
import ConfigInfo from "./config-info";
import RelativeObject from "./relative-object";

export interface IProps {
  current: ICluster;
  refetch: Function;
  serRouterTabTarget?: (prop: string) => void;
}

const Overview: FC<IProps> = ({ current, serRouterTabTarget }) => {
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
      capacityUsage: {
        resourceKey: "capacityUsage",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <CapacityUsage detail={current} {...props} />
        ),
      },
      configInfo: {
        resourceKey: "configInfo",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <ConfigInfo
            detail={current}
            serRouterTabTarget={serRouterTabTarget}
            {...props}
          />
        ),
      },
      relativeObject: {
        resourceKey: "relativeObject",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeObject detail={current} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-cluster"
      cols={2}
      dataSet={dataSet}
    />
  );
};

export default Overview;
