import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { Zone } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import CapacityUsage from "./capacity-usage";

const MARGIN_BOTTOM_12_STYLE = { marginBottom: 12 } as const;

interface IProps {
  current: Zone;
  topo: React.ReactNode;
}

const Overview: React.FC<IProps> = ({ current, topo }) => {
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
          <CapacityUsage uuid={current.uuid} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <>
      <div style={MARGIN_BOTTOM_12_STYLE}> {topo}</div>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-zone"
        cols={2}
        dataSet={dataSet}
      />
    </>
  );
};

export default Overview;
