import { OperationStatus as IStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

export const useIsLogCollect = (operationLog: OperationLog | undefined) => {
  return useMemo<boolean>(() => {
    return (
      ["CREATE_LOG_COLLECT", "RE_CREATE_LOG_COLLECT"].includes(
        operationLog?.operationTasks?.[0]?.operationApis?.[0]?.name as string,
      ) && operationLog?.status === IStatus.Running
    );
  }, [operationLog]);
};
