import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

export const useJobResponse = (operationLog: OperationLog | undefined) => {
  return useMemo(() => {
    try {
      const _jobResp = JSON.parse(
        operationLog?.operationTasks?.[0]?.operationApis?.[0]?.resp ||
          operationLog?.operationTasks?.[0]?.operationApis?.[1]?.resp ||
          "{}",
      );

      return _jobResp?.inventory ? _jobResp?.inventory : _jobResp;
    } catch {
      return {};
    }
  }, [operationLog]);
};
