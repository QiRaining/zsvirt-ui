import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type {
  SnapshotStrategy,
  SnapshotStrategyTrigger,
} from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

import {
  formatCronDescription,
  getNextExecutionTime,
  parseCron,
} from "../../util";
import CardAction from "./card-action";

interface IProps extends IDraggableCardProps {
  current?: SnapshotStrategy;
}

export default function ExecutionStrategy({ current, ...props }: IProps) {
  const intl = useIntl();

  const trigger = current?.triggers?.[0];
  let list = useMemo<ListItem[]>(() => {
    return [
      {
        label: intl.formatMessage({
          id: "scheduled.snapshot.period",
          defaultMessage: "Scheduled Snapshot Cycle",
        }),
        value: trigger && formatCronDescription(intl, parseCron(trigger.cron)),
      },
      {
        label: intl.formatMessage({
          id: "next.execute.time",
          defaultMessage: "Next Execution Time",
        }),
        value: undefined,
      },
      {
        label: intl.formatMessage({
          id: "startTime",
          defaultMessage: "Start Time",
        }),
        value:
          trigger &&
          dayjs(new Date(trigger.startTime)).format("YYYY-MM-DD HH:mm"),
      },
      {
        label: intl.formatMessage({
          id: "endTime",
          defaultMessage: "End Time",
        }),
        value: trigger && formatStopTime(intl, trigger),
      },
      {
        label: intl.formatMessage({
          id: "snapshot.kept.count",
          defaultMessage: "Retained Snapshots",
        }),
        value: JSON.parse(current?.jobData ?? "{}").snapshotGroupMaxNumber,
      },
    ];
  }, [current, intl, trigger]);

  if (trigger) {
    list = [...list];
    list[1].value = formatNextExecuteTime(trigger);
  }

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "executeStrategy",
        defaultMessage: "Execution Policy",
      })}
      isList
      extra={<CardAction current={current} actionKey="virtualization.edit" />}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}

function formatNextExecuteTime(trigger: SnapshotStrategyTrigger) {
  const cronParam = parseCron(trigger.cron);
  const nextExecuteTime = getNextExecutionTime({
    ...cronParam,
    currentTime: dayjs(),
    startTime: dayjs(new Date(trigger.startTime)),
    endTime: trigger.stopTime ? dayjs(new Date(trigger.stopTime)) : undefined,
  });
  return nextExecuteTime?.format("YYYY-MM-DD HH:mm");
}

function formatStopTime(intl: IntlShape, trigger: SnapshotStrategyTrigger) {
  return trigger.stopTime
    ? dayjs(new Date(trigger.stopTime)).format("YYYY-MM-DD HH:mm")
    : intl.formatMessage({ id: "never", defaultMessage: "Never" });
}
