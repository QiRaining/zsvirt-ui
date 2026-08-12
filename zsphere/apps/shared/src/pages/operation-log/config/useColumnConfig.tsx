import { gql } from "@apollo/client";
import { Text, Tooltip } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Progress } from "@zstack/zsphere-components";
import useColumnConfig from "@zstack/zsphere-engine/src/operation-log/useColumnConfig";
import { OperationStatus } from "@zstack/zsphere-types";
import type {
  OperationLog,
  OperationTask,
} from "@zstack/zsphere-types/graphql";
import { formatSecToPeriodMaxUnitHour } from "@zstack/zsphere-utils";
import { useSize } from "ahooks";
import cls from "classnames";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { get, capitalize, filter, map, flatten } from "lodash-es";
import { useRef, useEffect, useState } from "react";
import { useIntl } from "react-intl";

dayjs.extend(duration);

import { getAllLongjobs } from "../action/validators";
import { useStateMap, useTextMap } from "../components/operation-status";
import useOperation from "../detail/hooks";
import { useZsvResume } from "../use-zsv-resume";

import style from "./style.module.less";

const handleSuccess = (operationTasks: OperationTask[]) => {
  const list = operationTasks.map((cv: any) =>
    cv?.operationApis.map((cv2: any) => cv2.status),
  );
  const statusFlattenList = flatten(list);

  if (statusFlattenList.every((cv) => cv === OperationStatus.Success)) {
    return OperationStatus.Success;
  }

  if (statusFlattenList.every((cv) => cv === OperationStatus.Failed)) {
    return OperationStatus.Failed;
  }
  return OperationStatus.Exception;
};

function StateProgress({ state, progress, ...props }: any) {
  const { renderState } = useStateMap();
  const textMap = useTextMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const [progressElem, setProgressElem] = useState<any>();
  const progressSize = useSize(progressElem);
  const showText = !!progressSize.width && progressSize.width > 12;

  useEffect(() => {
    const elem = containerRef.current?.querySelector(".ant-progress-inner");
    if (elem) {
      setProgressElem(elem);
    }
  }, []);

  const renderContent = () => (
    <div className={style["progress-wrapper"]}>
      {renderState({
        name: get(textMap, capitalize(state?.toLowerCase())),
        status: state,
      })}
      <Progress.Bar
        type="line"
        percent={progress ?? 0}
        colorful={false}
        {...props}
      />
    </div>
  );

  return (
    <div className={style.stateProgress}>
      <div className={style.hidden} ref={containerRef}>
        {renderContent()}
      </div>
      <div className={cls({ [style.hideText]: !showText })}>
        {renderContent()}
      </div>
    </div>
  );
}

export default ({
  setVisible,
  setActionId,
  view,
}: {
  setVisible: (visible: boolean) => void;
  setActionId: (actionId: string) => void;
  view?: string;
}) => {
  const { getServerTime } = useTime();
  const intl = useIntl();
  const { renderState } = useStateMap();
  const textMap = useTextMap();
  const resume = useZsvResume();
  const { getActionFailedReason } = useOperation();

  const renderProgress = (row: OperationLog) => {
    const longjob = getAllLongjobs(row)?.[0];
    if (longjob) {
      return (
        <StateProgress state={longjob?.state} progress={longjob?.progress} />
      );
    }
    const apolloClient = window.g_main.apolloClient;
    const id = apolloClient.cache.identify({
      __typename: "OperationLog",
      actionId: row.actionId,
    });
    const fragment = gql`
      fragment OperationLogFragment on OperationLog {
        progress
      }
    `;
    // 读取并保存初始状态
    const cacheData = apolloClient.readFragment({
      id,
      fragment,
    });
    return (
      <StateProgress
        state={row.status}
        progress={cacheData?.progress}
        needDecimal={false}
        format={false}
      />
    );
  };

  return useColumnConfig([
    {
      key: "name",
      width: 160,
      title: intl.formatMessage({
        id: "task.description",
        defaultMessage: "Task Description",
      }),
      render: (row: OperationLog) => {
        return (
          <div
            onClick={() => {
              setActionId(row.actionId);
              setVisible(true);
            }}
          >
            <Text className={style.operationName}>{row.name}</Text>
          </div>
        );
      },
    },
    {
      key: "createDate",
      title: intl.formatMessage({
        id: "start.time",
        defaultMessage: "Start Time",
      }),
    },
    {
      key: "excuteTime",
      title: intl.formatMessage({ id: "used.time", defaultMessage: "Time Consumed" }),
      formatter: (row: OperationLog) => getUseTime(row, intl),
      sorter: (a: OperationLog, b: OperationLog) =>
        Number(a.lastOpDate) -
        Number(a.createDate) -
        (Number(b.lastOpDate) - Number(b.createDate)),
    },

    {
      key: "resource",
      gqlKey: "operationTasks",
      width: 320,
      title: intl.formatMessage({ id: "object", defaultMessage: "Target" }),
      formatter: (row: OperationLog) => {
        if (row.resourceNames?.length) {
          return row.resourceNames.join("/");
        }
        try {
          const resourceName = filter(
            map(get(row, "operationTasks.[0].operationApis"), "resourceName"),
            (e) => !!e,
          )?.[0];

          const resourceUuid = JSON.parse(
            get(row, "operationTasks.[0].operationApis.[0].req") || "{}",
          ).uuid;

          if (!row.operationTasks || row.operationTasks.length === 0) {
            return "-";
          }

          if (row.operationTasks?.length === 1) {
            return resourceName || resourceUuid;
          }
          if (row.operationTasks?.length > 1) {
            const displayName = resourceName || resourceUuid;
            if (displayName) {
              const taskNames = intl.formatMessage(
                {
                  id: "task.object.count",
                  defaultMessage: `{name} has {count} items.`,
                },
                {
                  name: displayName,
                  count: row.operationTasks?.length,
                },
              );

              return taskNames;
            }
          }
          return "-";
        } catch {
          return "-";
        }
      },
    },
    {
      key: "remainTime",
      render: (_value: any, row: any) => {
        if (row.longjobs?.length) {
          const r = resume(row);
          const file = r?.getFile?.();
          const remain = file?.remainTime() || "";
          if (remain > 0) {
            const d = dayjs.duration(Math.ceil(remain), "milliseconds");
            return <div>{`${d.hours()}:${d.minutes()}:${d.seconds()}`}</div>;
          }
          return "";
        }
        return "";
      },
    },
    {
      key: "status", //here some bugs：
      width: ["virtualization.main", "main.global"].includes(view!)
        ? 240
        : undefined,
      minWidth: 120,
      render: (row: OperationLog) => {
        const { status, operationTasks = [] } = row;
        const opStatus =
          status === OperationStatus.Success
            ? handleSuccess(operationTasks)
            : status;
        const statusContent =
          ["virtualization.main", "main.global"].includes(view!) &&
          row.status === OperationStatus.Running
            ? renderProgress(row)
            : renderState({
                name: textMap[opStatus as "Success"],
                status: opStatus as OperationStatus,
              });
        return statusContent;
      },
      filters: Object.keys(textMap).map((cv) => ({
        text: renderState({
          name: textMap[cv as OperationStatus],
          status: cv as OperationStatus,
        }),
        value: cv,
      })),
    },
    {
      key: "taskProgress",
      render: (_value: any, row: any) => renderProgress(row),
    },
    {
      key: "resourceCount",
      width: view === "main.global" ? 120 : undefined,
      gqlKey: "operationTasks",
      formatter: (row: any) => {
        return row.operationTasks?.length || "-";
      },
    },
    {
      key: "log.detail",
      render: (row: OperationLog) => {
        const reason = getActionFailedReason(row);
        if (!reason) {
          return "";
        }
        return (
          <Tooltip
            title={
              <>
                <div>{reason}</div>
                <a
                  className={style.detailLink}
                  onClick={() => {
                    setActionId(row.actionId);
                    setVisible(true);
                  }}
                >
                  {intl.formatMessage({
                    id: "check.detail",
                    defaultMessage: "View Details",
                  })}
                </a>
              </>
            }
            getPopupContainer={(elem) =>
              elem.closest('[style*="position: relative"]') || document.body
            }
          >
            <Text>{reason}</Text>
          </Tooltip>
        );
      },
    },
    {
      key: "lastOpDate",
      formatter: (row: any) =>
        row.lastOpDate
          ? getServerTime(parseInt(row.lastOpDate, 10)).format(
              "YYYY-MM-DD HH:mm:ss",
            )
          : "-",
    },
    {
      key: "accountName",
      gqlKey: ["userName", "accountName"],
      filterMultiple: false,
      auth: {
        resource: "operation.log",
        type: "block",
        authKey: "account.name",
      },
      formatter: (row: OperationLog) =>
        row?.userName ||
        `${row.accountName} (${intl.formatMessage({
          id: "deleted",
          defaultMessage: "Deleted",
        })})`,
    },
  ]);
};

export const getUseTime = (
  row: OperationLog | undefined,
  intl: any,
): string => {
  if (!row) {
    return "-";
  }
  const lastOpDate = Number(row.lastOpDate);
  const createDate = Number(row.createDate);
  if (
    Number.isNaN(lastOpDate) ||
    Number.isNaN(createDate) ||
    createDate > lastOpDate
  ) {
    return "-";
  }
  return formatSecToPeriodMaxUnitHour(
    Math.floor((Number(row.lastOpDate) - Number(row.createDate)) / 1000),
    intl,
  );
};
