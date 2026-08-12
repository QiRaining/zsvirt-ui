import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, DraggableCard, State } from "@zstack/zsphere-components";
import { SchedulerJobGroupType } from "@zstack/zsphere-types";
import type {
  SchedulerJobHistoryGroupByFireInstanceId,
  SchedulerJobGroup,
} from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod, formatBytesToSize } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

export interface IProps extends IDraggableCardProps {
  current?: SchedulerJobHistoryGroupByFireInstanceId;
  source?: SchedulerJobGroup;
}

export default function BasicInfo({ current, source, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "backup.policy",
          defaultMessage: "Backup Plan",
        }),
        value: source?.name,
      },
      {
        label: intl.formatMessage({
          id: "backup.entity",
          defaultMessage: "Backup Object",
        }),
        value:
          source?.jobType === SchedulerJobGroupType.databaseBackup
            ? intl.formatMessage({
                id: "platform.database",
                defaultMessage: "Platform Database",
              })
            : intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
      },
      {
        label: intl.formatMessage({
          id: "backup.method",
          defaultMessage: "Backup Mode",
        }),
        value:
          current?.mode === "full"
            ? intl.formatMessage({
                id: "backup.mode.full",
                defaultMessage: "Full",
              })
            : intl.formatMessage({
                id: "backup.mode.incremental",
                defaultMessage: "Incremental",
              }),
      },
      {
        label: intl.formatMessage({
          id: "backup.resource",
          defaultMessage: "Backup Resources",
        }),
        value: current?.resourceCount,
      },
      {
        label: intl.formatMessage({
          id: "backup.total.capacity",
          defaultMessage: "Total Backup Size",
        }),
        value:
          current?.backupCapacityForSchedulerJobHistoryGroup &&
          formatBytesToSize(current.backupCapacityForSchedulerJobHistoryGroup),
      },
      {
        label: intl.formatMessage({
          id: "backup.task.result",
          defaultMessage: "Backup Job Result",
        }),
        value: formatExecutionResult(
          intl,
          current?.runningCount,
          current?.successCount,
          current?.failCount,
        ),
      },
      {
        label: intl.formatMessage({
          id: "backup.time.consumption",
          defaultMessage: "Time Consumed",
        }),
        value:
          current?.executeTime && formatSecToPeriod(current.executeTime, intl),
      },
      {
        label: intl.formatMessage({
          id: "startTime",
          defaultMessage: "Start Time",
        }),
        value:
          current?.startExecutionTime &&
          dayjs(Number(current.startExecutionTime)).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
      },
      {
        label: intl.formatMessage({
          id: "finished.time",
          defaultMessage: "Completion Time",
        }),
        value:
          current?.endTime &&
          dayjs(Number(current.endTime)).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [current, intl, source],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "basicInfo",
        defaultMessage: "Basic Info",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}

function formatExecutionResult(
  intl: IntlShape,
  runningCount: number = 0,
  successCount: number = 0,
  failCount: number = 0,
) {
  if (runningCount > 0) {
    return (
      <State
        type="progress"
        name={intl.formatMessage({ id: "ongoing", defaultMessage: "Ongoing" })}
      />
    );
  }
  if (successCount > 0 && failCount === 0) {
    return (
      <State
        type="success"
        name={intl.formatMessage({ id: "success", defaultMessage: "Succeeded" })}
      />
    );
  }
  if (failCount > 0 && successCount === 0) {
    return (
      <State
        type="error"
        name={intl.formatMessage({ id: "fail", defaultMessage: "Failed" })}
      />
    );
  }
  if (failCount > 0 && successCount > 0) {
    return (
      <State
        type="warning"
        name={intl.formatMessage(
          {
            id: "snapshot.strategy.job.partialSuccess",
            defaultMessage: "{successCount} succeeded and {failCount} failed",
          },
          {
            successCount,
            failCount,
          },
        )}
      />
    );
  }
}
