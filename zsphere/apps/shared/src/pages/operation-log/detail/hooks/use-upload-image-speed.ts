import type { OperationLongjobStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { useEffect, useState } from "react";

import { getAllLongjobs } from "../../action/validators";
import { useZsvResume } from "../../use-zsv-resume";

export const useUploadImageSpeed = (
  operationLog?: OperationLog,
  longJobState?: OperationLongjobStatus,
) => {
  const [speed, setSpeed] = useState<string>("");
  const [complete, setComplete] = useState<string>("");
  const [current, setCurrent] = useState<any>();
  const resume = useZsvResume();
  const currentLongjob = operationLog
    ? getAllLongjobs(operationLog)?.[0]
    : undefined;

  useEffect(() => {
    if (current) {
      current?.monitor((s: any, _complete: any) => {
        setComplete(_complete);
        setSpeed(`${Number((s / (1024 * 1024)).toFixed(2))} MB/s`);
      });
    }
  }, [current, longJobState]);

  useEffect(() => {
    if (operationLog && current?.jobId !== currentLongjob?.longJobUuid) {
      setCurrent(resume(operationLog)?.getFile());
    }
  }, [
    operationLog,
    resume,
    longJobState,
    current?.jobId,
    currentLongjob?.longJobUuid,
  ]);
  return { speed, complete };
};
