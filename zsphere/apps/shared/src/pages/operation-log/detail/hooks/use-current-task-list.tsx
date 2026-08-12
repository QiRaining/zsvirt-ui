import type { OperationTask } from "@zstack/zsphere-types/graphql";
import { get } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { OperationTaskStatus } from "../../components/operation-status";
import useOperation from "../hooks";

import style from "../style.module.less";

export const useCurrentTaskList = (currentTask: OperationTask | undefined) => {
  const intl = useIntl();
  const { getTaskFailedReason } = useOperation();
  const taskFailedReason = useMemo(() => {
    return getTaskFailedReason(currentTask);
  }, [currentTask, getTaskFailedReason]);

  const getResourceName = (task?: OperationTask) => {
    if (!task) {
      return "-";
    }
    return get(task, "operationApis.[0].resourceName");
    // resp 和 req 都可能为null 请确保返回值全链路取值安全 所有属性加?
  };

  return useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "object",
          defaultMessage: "Target",
        }),
        value: getResourceName(currentTask),
      },
      {
        label: "Task ID",
        value: currentTask?.taskId,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "subTask.result",
          defaultMessage: "Sub-task Result",
        }),
        value: <OperationTaskStatus operationTask={currentTask} />,
      },
      {
        label: intl.formatMessage({
          id: "failedReason",
          defaultMessage: "Failure Cause",
        }),
        value: <div className={style.failedReason}>{taskFailedReason}</div>,
        show: taskFailedReason,
      },
    ];
  }, [currentTask, taskFailedReason]);
};
