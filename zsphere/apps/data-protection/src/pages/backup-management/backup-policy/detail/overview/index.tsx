import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

import BackupStorage from "./backup-storage";
import ExecutionStrategy from "./backup-strategy";
import BasicInfo from "./basic-info";
import RetentionPolicy from "./retention-policy";

import style from "./style.module.less";

type Dataset = Parameters<typeof ResponsiveDndCardsLayout>[0]["dataSet"];

export interface IProps {
  current?: SchedulerJobGroup;
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
      backupStorage: {
        resourceKey: "backupStorage",
        x: 0,
        y: 1,
        node: (props: IDraggableCardProps) => (
          <BackupStorage current={current} {...props} />
        ),
      },
      retentionPolicy: {
        resourceKey: "retentionPolicy",
        x: 1,
        y: 1,
        node: (props: IDraggableCardProps) => (
          <RetentionPolicy current={current} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <div className={style.container}>
      <div className={style.card}>
        <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="backup-policy"
          cols={2}
          dataSet={dataSet}
        />
      </div>
    </div>
  );
}
