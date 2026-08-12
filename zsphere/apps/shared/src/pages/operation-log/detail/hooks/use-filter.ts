import { OperationStatus as IStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { cloneDeep } from "lodash-es";
import { useMemo, useState } from "react";

export const useFilter = (operationLog: OperationLog | undefined) => {
  const [filterCondition, setFilterCondition] = useState<string>("all");

  const filterTask = useMemo(() => {
    if (filterCondition === "all") {
      const operationTasksList = cloneDeep(operationLog?.operationTasks) || [];
      return (
        operationTasksList.sort((a, b) => {
          const orderList = [
            IStatus.Failed,
            IStatus.Exception,
            IStatus.Canceled,
            IStatus.Canceling,
            IStatus.Running,
            IStatus.Success,
          ];
          return (
            orderList.findIndex((cv) => cv === a.status) -
            orderList.findIndex((cv) => cv === b.status)
          );
        }) || []
      );
    }
    return (
      operationLog?.operationTasks?.filter(
        (cv) => cv.status === filterCondition,
      ) || []
    );
  }, [filterCondition, operationLog]);
  return { filterTask, filterCondition, setFilterCondition };
};
