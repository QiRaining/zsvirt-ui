import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { State } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/scheduler-job-history";
import type {
  SchedulerJobHistory as ISchedulerJobHistory,
  SchedulerJobHistoryGroupByFireInstanceId as ISchedulerJobHistoryGroupByFireInstanceId,
} from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod, formatBytesToSize } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import {
  isFinite as _isFinite,
  get as _get,
  isEqual as _isEqual,
  includes as _includes,
} from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

enum JobResult {
  All = "all",
  Success = "success",
  Fail = "fail",
  SomeSuccess = "someSuccess",
  Backuping = "backuping",
}

interface IProps {
  view?: string;
  type: "group" | "single";
}

enum JobMode {
  All = "All",
  Incremental = "incremental",
  Full = "full",
}

export default ({ view, type }: IProps) => {
  const intl = useIntl();

  const { getServerTime } = useTime();

  const backupMethodFilterOptions = useMemo(() => {
    if (_isEqual(view, "sub.database")) {
      return;
    }

    if (_includes(["sub.overview.detail", "sub.scheduler.job.group"], view)) {
      return [
        {
          text: intl.formatMessage({
            id: "modeIncremental",
            defaultMessage: "Incremental",
          }),
          value: JobMode.Incremental,
        },
        {
          text: intl.formatMessage({ id: "modeFull", defaultMessage: "Full" }),
          value: JobMode.Full,
        },
      ];
    }

    return [
      {
        text: intl.formatMessage({ id: "whole", defaultMessage: "All" }),
        value: "all",
      },
      {
        text: intl.formatMessage({ id: "mode.full", defaultMessage: "Full" }),
        value: "full",
      },
      {
        text: intl.formatMessage({
          id: "mode.incremental",
          defaultMessage: "Incremental",
        }),
        value: "increment",
      },
    ];
  }, [intl, view]);

  const getResultContent = ({
    runningCount,
    successCount,
    failCount,
    success,
    resultDump,
  }: {
    runningCount: number | undefined;
    successCount: number | undefined;
    failCount: number | undefined;
    success: boolean;
    resultDump: string;
  }) => {
    // 其他view 下 几个result count 可能不存在。

    if ((runningCount && runningCount > 0) || resultDump === "Running") {
      return (
        <State
          type="progress"
          name={intl.formatMessage({
            id: "backuping",
            defaultMessage: "Backing Up",
          })}
        />
      );
    }
    if (
      (successCount &&
        failCount !== undefined &&
        successCount > 0 &&
        failCount <= 0) ||
      (success && view !== "sub.scheduler.job.group")
    ) {
      return (
        <State
          type="success"
          name={intl.formatMessage({ id: "success", defaultMessage: "Succeeded" })}
        />
      );
    }
    if (
      (failCount &&
        failCount > 0 &&
        successCount !== undefined &&
        successCount <= 0) ||
      (!success && view !== "sub.scheduler.job.group")
    ) {
      return (
        <State
          type="error"
          name={intl.formatMessage({ id: "fail", defaultMessage: "Failed" })}
        />
      );
    }
    if (failCount && failCount > 0 && successCount && successCount > 0) {
      return (
        <State
          type="warning"
          name={intl.formatMessage(
            {
              id: "backup.job.warning",
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
  };

  const getResourceName = (
    record: ISchedulerJobHistory | ISchedulerJobHistoryGroupByFireInstanceId,
  ) => {
    const dataBaseResourceUuid = "7ae6456c0b01324dae6d4bef358a5772";
    if (record?.resourceInfo?.uuid === dataBaseResourceUuid) {
      return intl.formatMessage({
        id: "mnNodeDatabase",
        defaultMessage: "Management Node Database",
      });
    }
    return record?.resourceInfo?.name;
  };

  const filters = useMemo(() => {
    if (view === "sub.scheduler.job.history.detail") {
      return [
        {
          text: intl.formatMessage({ id: "all", defaultMessage: "All" }),
          value: "all",
        },
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
            id: "backuping",
            defaultMessage: "Backing Up",
          }),
          value: "backuping",
        },
      ];
    }

    if (view === "sub.scheduler.job.group") {
      return [
        {
          text: intl.formatMessage({ id: "success", defaultMessage: "Succeeded" }),
          value: JobResult.Success,
        },
        {
          text: intl.formatMessage({ id: "fail", defaultMessage: "Failed" }),
          value: JobResult.Fail,
        },
        {
          text: intl.formatMessage({
            id: "someSuccess",
            defaultMessage: "Partially Succeeded",
          }),
          value: JobResult.SomeSuccess,
        },
        {
          text: intl.formatMessage({
            id: "backuping",
            defaultMessage: "Backing Up",
          }),
          value: JobResult.Backuping,
        },
      ];
    }

    if (view === "sub.overview.detail") {
      return [
        {
          text: intl.formatMessage({ id: "success", defaultMessage: "Succeeded" }),
          value: JobResult.Success,
        },
        {
          text: intl.formatMessage({ id: "fail", defaultMessage: "Failed" }),
          value: JobResult.Fail,
        },
        {
          text: intl.formatMessage({
            id: "backuping",
            defaultMessage: "Backing Up",
          }),
          value: JobResult.Backuping,
        },
      ];
    }

    return [
      {
        text: intl.formatMessage({ id: "all", defaultMessage: "All" }),
        value: "all",
      },
      {
        text: intl.formatMessage({ id: "success", defaultMessage: "Succeeded" }),
        value: JobResult.Success,
      },
      {
        text: intl.formatMessage({ id: "fail", defaultMessage: "Failed" }),
        value: JobResult.Fail,
      },
      {
        text: intl.formatMessage({
          id: "someSuccess",
          defaultMessage: "Partially Succeeded",
        }),
        value: JobResult.SomeSuccess,
      },
      {
        text: intl.formatMessage({ id: "backuping", defaultMessage: "Backing Up" }),
        value: JobResult.Backuping,
      },
    ];
  }, [view, intl]);

  return useColumnConfig<
    ISchedulerJobHistory | ISchedulerJobHistoryGroupByFireInstanceId
  >([
    {
      key: "execute.time",
      render: ({ executeTime = 0 }) => formatSecToPeriod(executeTime, intl),
    },
    {
      key: "backup.data",
      render: ({ requestDump }) =>
        _get(JSON.parse(String(requestDump)), "name"),
    },
    {
      key: "backup.resource.name",
      render: ({ requestDump }) =>
        _get(JSON.parse(String(requestDump)), "name"),
    },
    {
      key: "resource.name",
      render: (resource) => getResourceName(resource),
    },
    {
      key: "backup.method",
      searchKey: "__backupMode__",
      filterMultiple: false,
      filters: backupMethodFilterOptions,
      formatter: (resource) =>
        "mode" in resource && resource?.mode === "full"
          ? intl.formatMessage({ id: "mode.full", defaultMessage: "Full" })
          : intl.formatMessage({
              id: "mode.incremental",
              defaultMessage: "Incremental",
            }),
    },
    {
      key: "resource.num",
      render: ({ resourceCount }) => resourceCount,
    },
    {
      key: "job.result",
      searchKey: "__jobResult__",
      filterMultiple: false,
      filters,
      render: ({
        runningCount,
        failCount,
        successCount,
        success,
        resultDump,
      }) =>
        getResultContent({
          runningCount,
          successCount,
          failCount,
          success,
          resultDump,
        }),
    },
    {
      key: "startExecutionTime",
      sortKey: "startTime",
      render: ({ startExecutionTime }) => {
        const val = _isFinite(Number(startExecutionTime))
          ? dayjs(Number(startExecutionTime)).format("YYYY-MM-DD HH:mm:ss")
          : getServerTime(startExecutionTime).format("YYYY-MM-DD HH:mm:ss");
        return (
          <Text>
            <>{val}</>
          </Text>
        );
      },
    },
    {
      key: "startTime",
      render: ({ startTime }) => {
        return _isFinite(Number(startTime))
          ? dayjs(Number(startTime)).format("YYYY-MM-DD HH:mm:ss")
          : getServerTime(startTime).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      key: "endTime",
      render: ({ endTime }) =>
        _isFinite(Number(endTime))
          ? dayjs(Number(endTime)).format("YYYY-MM-DD HH:mm:ss")
          : getServerTime(endTime).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      key: "backupCapacity",
      width: 100,
      render: (value: any) => {
        return (
          <Text>
            {formatBytesToSize(
              (type === "group"
                ? value?.backupCapacityForSchedulerJobHistoryGroup
                : value?.backupCapacity) ?? 0,
            )}
          </Text>
        );
      },
    },
  ]);
};
