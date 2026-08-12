import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import ConfigInfo from "./config-info";

import style from "./style.module.less";

interface IProps {
  current: ICluster;
  refetch?: () => void;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (_props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo detail={current} refetch={refetch} />
        ),
      },
      relatedResource: {
        resourceKey: "relatedResource",
        x: 1,
        y: 0,
        node: (_props: Omit<IDraggableCardProps, "detail">) => (
          <ConfigInfo clusterDetail={current} refetch={refetch} />
        ),
      },
    };
    return result;
  }, [current]);

  return (
    <div className={style.container}>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="network-resource-l2network"
        cols={2}
        dataSet={dataSet}
      />
    </div>
  );
};

export default Overview;
