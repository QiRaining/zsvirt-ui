import type { OperationLog } from "@zstack/zsphere-types/graphql";

import { getAllLongjobs, isUploadLongjob } from "./validators";

interface UploadCancelControl {
  del: () => void;
}

type GetUploadCancelControl = (
  operationLog: OperationLog,
) => UploadCancelControl;

export const cancelLocalUploadSessions = (
  operationLogs: OperationLog[],
  getUploadControl: GetUploadCancelControl,
) => {
  operationLogs.forEach((operationLog) => {
    const allJobs = getAllLongjobs(operationLog);
    const targetLongJobUuid = operationLog?.uuid;
    const shouldCancelLocalUpload = allJobs.some(
      (job) =>
        (!targetLongJobUuid || job.longJobUuid === targetLongJobUuid) &&
        isUploadLongjob(job, operationLog, allJobs),
    );

    if (shouldCancelLocalUpload) {
      getUploadControl(operationLog).del();
    }
  });
};
