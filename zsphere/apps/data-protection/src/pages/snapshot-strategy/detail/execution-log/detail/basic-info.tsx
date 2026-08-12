import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, DraggableCard, State } from "@zstack/zsphere-components";
import type { SchedulerJobHistoryGroupByFireInstanceId } from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

export interface IProps extends IDraggableCardProps {
  current?: SchedulerJobHistoryGroupByFireInstanceId;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "operation.name",
          defaultMessage: "Task Description",
        }),
        value: intl.formatMessage({
          id: "scheduled.auto.snapshot",
          defaultMessage: "Scheduled Snapshot",
        }),
      },
      {
        label: intl.formatMessage({
          id: "execution.startTime",
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
          id: "process.status",
          defaultMessage: "Result",
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
          id: "resource.count",
          defaultMessage: "Resources",
        }),
        value: current?.resourceCount,
      },
      {
        label: intl.formatMessage({ id: "used.time", defaultMessage: "Time Consumed" }),
        value:
          typeof current?.executeTime === "number" &&
          formatSecToPeriod(current.executeTime, intl),
      },
      {
        label: intl.formatMessage({
          id: "execution.endTime",
          defaultMessage: "Completion Time",
        }),
        value:
          current?.endTime &&
          dayjs(Number(current.endTime)).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: "Action ID",
        copyable: true,
        value: current?.fireInstanceId,
      },
    ],
    [current, intl],
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

export function formatExecutionResult(
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
