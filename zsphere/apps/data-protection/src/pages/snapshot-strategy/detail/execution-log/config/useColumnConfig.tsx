import { Text } from "@zstack/design";
import { useColumnConfig } from "@zstack/zsphere-engine/src/scheduler-job-history";
import type { SchedulerJobHistoryGroupByFireInstanceId } from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

import { formatExecutionResult } from "../detail/basic-info";

export interface IProps {
  setDetail: (value: SchedulerJobHistoryGroupByFireInstanceId) => void;
  setVisible: (value: boolean) => void;
}

export default ({ setDetail, setVisible }: IProps) => {
  const intl = useIntl();
  return useColumnConfig<SchedulerJobHistoryGroupByFireInstanceId>([
    {
      key: "operationName",
      render: (current) => {
        return (
          <Text>
            <a
              onClick={() => {
                setDetail(current);
                setVisible(true);
              }}
            >
              {intl.formatMessage({
                id: "scheduled.auto.snapshot",
                defaultMessage: "Scheduled Snapshot",
              })}
            </a>
          </Text>
        );
      },
    },
    {
      key: "startTime",
      formatter: ({ startExecutionTime }) =>
        startExecutionTime && Number(startExecutionTime),
    },
    {
      key: "process.status",
      searchKey: "__jobResult__",
      filterMultiple: false,
      filters: [
        {
          text: intl.formatMessage({ id: "success", defaultMessage: "Succeeded" }),
          value: "success",
        },
        {
          text: intl.formatMessage({ id: "fail", defaultMessage: "Failed" }),
          value: "fail",
        },
        {
          text: intl.formatMessage({
            id: "someSuccess",
            defaultMessage: "Partially Succeeded",
          }),
          value: "someSuccess",
        },
      ],
      render: ({ runningCount, failCount, successCount }) =>
        formatExecutionResult(intl, runningCount, successCount, failCount),
    },
    {
      key: "resource.count",
      formatter: ({ resourceCount }) => resourceCount,
    },
    {
      key: "duration",
      formatter: ({ executeTime = 0 }) => formatSecToPeriod(executeTime, intl),
    },
    {
      key: "execution.endTime",
      formatter: ({ endTime }) => endTime && Number(endTime),
    },
  ]);
};
