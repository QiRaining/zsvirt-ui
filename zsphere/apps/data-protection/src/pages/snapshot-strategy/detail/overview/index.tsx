import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { SnapshotStrategy } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

import BasicInfo from "./basic-info";
import ExecutionStrategy from "./execution-strategy";

import style from "./style.module.less";

type Dataset = Parameters<typeof ResponsiveDndCardsLayout>[0]["dataSet"];

export interface IProps {
  current?: SnapshotStrategy;
}

export default function Overview({ current }: IProps) {
  const dataSet = useMemo<Dataset>(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: IDraggableCardProps) => (
          <BasicInfo current={current} {...props} />
        ),
      },
      executionStrategy: {
        resourceKey: "executionStrategy",
        x: 1,
        y: 0,
        node: (props: IDraggableCardProps) => (
          <ExecutionStrategy current={current} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <div className={style.container}>
      <div className={style.card}>
        <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="snapshot-strategy"
          cols={2}
          dataSet={dataSet}
        />
      </div>
    </div>
  );
}
