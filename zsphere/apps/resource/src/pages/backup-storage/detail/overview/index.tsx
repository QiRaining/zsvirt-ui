import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import CapacityUsage from "./capacity-usage";
import RelativeResource from "./relative-object";
import Settings from "./settings";

import style from "./style.module.less";

interface IProps {
  current: IBackupStorage;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const dataSet = useMemo(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo detail={current} refetch={refetch} {...props} />
        ),
      },
      capacityUsage: {
        resourceKey: "capacityUsage",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <CapacityUsage detail={current} {...props} />
        ),
      },
      relativeResource: {
        resourceKey: "relativeResource",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeResource detail={current} {...props} />
        ),
      },
      settings: {
        resourceKey: "settings",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <Settings {...props} detail={current} />
        ),
      },
    };
  }, [current]);

  return (
    <div className={style.container}>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-backup-storage"
        cols={2}
        dataSet={dataSet}
      />
    </div>
  );
};

export default Overview;
