import {
  OperationStatus as IStatus,
  OperationApiStatus as IOperationApiStatus,
} from "@zstack/zsphere-types";
import type {
  OperationApi,
  OperationLog,
  OperationTask,
} from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";

const useOperation = () => {
  const intl = useIntl();

  const handleApiResp = useCallback(
    (api?: OperationApi) => {
      if (!api) {
        return "";
      }

      const { resp } = api;
      if (!resp) {
        return "";
      }

      try {
        const res = JSON.parse(resp);
        const jobResult = JSON.parse(res.jobResult ?? "{}");

        return (
          res?.error?.messages?.[
            intl.locale === "zh-CN" ? "message_cn" : "message_en"
          ] ||
          res?.error?.details ||
          jobResult?.detail ||
          res?.inventories?.find((it: any) => it.error)?.error?.detail || // 批量执行的API error信息会放于inventories中
          res?.cause
        );
      } catch {
        return "";
      }
    },
    [intl.locale],
  );

  const getActionFailedReason = useCallback(
    (operationLog?: OperationLog) => {
      if (!operationLog) {
        return "";
      }

      if (operationLog.status !== IStatus.Failed) {
        return "";
      }

      const failedTasks = (operationLog.operationTasks ?? []).filter(
        (task) => task.status === IStatus.Failed,
      );

      // 遍历所有失败的 task
      for (const task of failedTasks) {
        const failedApis = (task.operationApis ?? []).filter(
          (api) => api.status === IOperationApiStatus.Failed,
        );

        // 遍历所有失败的 api，找到第一个有错误信息的
        for (const api of failedApis) {
          const reason = handleApiResp(api);
          if (reason) {
            return reason;
          }
        }
      }

      return "";
    },
    [handleApiResp],
  );

  const getTaskFailedReason = useCallback(
    (currentTask?: OperationTask) => {
      if (!currentTask) {
        return "";
      }

      if (currentTask.status !== IStatus.Failed) {
        return "";
      }

      const failedApi = currentTask.operationApis?.find(
        (api) => api.status === IOperationApiStatus.Failed,
      );
      return handleApiResp(failedApi);
    },
    [handleApiResp],
  );

  return {
    getActionFailedReason,
    getTaskFailedReason,
  };
};

export default useOperation;
